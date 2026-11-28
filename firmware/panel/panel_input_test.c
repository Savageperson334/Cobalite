#include "panel_input.h"
#include <assert.h>
#include <stdio.h>
int main(void){PanelInput p;PanelEvent e;panel_input_init(&p);
 panel_input_switch(&p,P_SHIFT,true,100);panel_input_switch(&p,P_SHIFT,false,104);panel_input_switch(&p,P_SHIFT,true,106);panel_input_switch(&p,P_SHIFT,true,117);assert(!panel_input_pop(&p,&e,117));panel_input_switch(&p,P_SHIFT,true,118);assert(panel_input_pop(&p,&e,118)&&e.kind==E_DOWN&&e.id==P_SHIFT);
 panel_input_turn(&p,P_CUTOFF,-70,120);assert(panel_input_pop(&p,&e,120)&&e.a==-32);assert(panel_input_pop(&p,&e,120)&&e.a==-32);assert(panel_input_pop(&p,&e,120)&&e.a==-6);
 panel_input_switch(&p,P_SHIFT,false,121);panel_input_switch(&p,P_SHIFT,false,133);assert(panel_input_pop(&p,&e,133)&&e.kind==E_UP);
 panel_input_switch(&p,P_CUTOFF,true,140);panel_input_switch(&p,P_CUTOFF,true,160);assert(!panel_input_pop(&p,&e,160));panel_input_turn(&p,P_SHIFT,1,160);assert(!panel_input_pop(&p,&e,160));
 panel_input_xy(&p,5000,0,170);assert(panel_input_pop(&p,&e,170)&&e.kind==E_XY&&e.a==4095&&e.b==0);
 for(unsigned i=0;i<=PANEL_QUEUE;i++){panel_input_turn(&p,P_RATE,1,200+i);}assert(panel_input_pop(&p,&e,300)&&e.kind==E_CANCEL);assert(!panel_input_pop(&p,&e,300));
 panel_input_switch(&p,P_RATE,true,UINT32_MAX-5);panel_input_switch(&p,P_RATE,true,7);assert(panel_input_pop(&p,&e,7)&&e.kind==E_DOWN);
 puts("panel input: debounce, relative detents, axis clamp, queue overflow cancellation and tick wrap passed");return 0;}
