#include "panel_input.h"
#include <string.h>
static bool is_button(PanelId id) {
 switch(id) { case P_MODE:case P_VELOCITY:case P_PRESSURE:case P_NOTE:case P_EXPR:case P_SHIFT:case P_SAVE:case P_PATCH:case P_INIT:return true;default:return false; }
}
static bool is_switch(PanelId id) {
 if(is_button(id))return true;
 switch(id){case P_ALGORITHM:case P_FXA:case P_FXB:case P_FXC:case P_RATE:case P_DEPTH:case P_ATTACK:case P_DECAY:case P_SUSTAIN:case P_PAGE:case P_EDIT:case P_ARP:case P_TEMPO:return true;default:return false;}
}
static bool valid(PanelId id){return id>=0&&id<P_COUNT;}
static void push(PanelInput *p, PanelEvent e){
 if(p->overflow)return;
 if(p->count==PANEL_QUEUE){p->overflow=true;p->read=p->write=p->count=0;return;}
 p->queue[p->write]=e;p->write=(uint8_t)((p->write+1u)%PANEL_QUEUE);p->count++;
}
void panel_input_init(PanelInput *p){memset(p,0,sizeof(*p));}
/* Call regularly with the current raw level, including while unchanged. */
void panel_input_switch(PanelInput *p,PanelId id,bool pressed,uint32_t ms){
 if(!valid(id)||!is_switch(id))return;
 if(p->raw[id]!=(uint8_t)pressed){p->raw[id]=(uint8_t)pressed;p->changed[id]=ms;}
 if(p->stable[id]!=p->raw[id]&&(uint32_t)(ms-p->changed[id])>=PANEL_DEBOUNCE_MS){p->stable[id]=p->raw[id];push(p,(PanelEvent){ms,pressed?E_DOWN:E_UP,(uint8_t)id,0,0});}
}
/* Board adapter supplies decoded signed detents; no assumed GPIO or quadrature wiring. */
void panel_input_turn(PanelInput *p,PanelId id,int16_t steps,uint32_t ms){
 if(!valid(id)||is_button(id)||id==P_SCREEN||id==P_JOYSTICK||!steps)return;
 while(steps){int16_t n=steps>32?32:steps<-32?-32:steps;push(p,(PanelEvent){ms,E_TURN,(uint8_t)id,n,0});steps=(int16_t)(steps-n);if(p->overflow)break;}
}
void panel_input_xy(PanelInput *p,uint16_t x,uint16_t y,uint32_t ms){
 push(p,(PanelEvent){ms,E_XY,P_JOYSTICK,(int16_t)(x>4095?4095:x),(int16_t)(y>4095?4095:y)});
}
bool panel_input_pop(PanelInput *p,PanelEvent *out,uint32_t ms){
 if(p->overflow){p->overflow=false;*out=(PanelEvent){ms,E_CANCEL,0,0,0};return true;}
 if(!p->count)return false;
 *out=p->queue[p->read];p->read=(uint8_t)((p->read+1u)%PANEL_QUEUE);p->count--;return true;
}
