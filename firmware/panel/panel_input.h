#ifndef COBALITE_PANEL_INPUT_H
#define COBALITE_PANEL_INPUT_H
#include <stdbool.h>
#include <stdint.h>
/* Logical IDs, not hardware scan codes. Keep in front-controller layout order. */
typedef enum { P_MODE,P_TUNEA,P_ALGORITHM,P_TUNEB,P_CUTOFF,P_FXWET,P_FXA,P_FXB,P_FXC,P_VOLUME,
 P_RATE,P_DEPTH,P_OSCA,P_BALANCE,P_OSCB,P_RESONANCE,P_FILTERMODE,P_ATTACK,P_DECAY,P_SUSTAIN,P_RELEASE,P_ENVDEPTH,
 P_JOYSTICK,P_DRIFT,P_VELOCITY,P_PRESSURE,P_NOTE,P_EXPR,P_PAGE,P_SCREEN,P_EDIT,P_SHIFT,P_SAVE,P_PATCH,P_INIT,P_ARP,P_TEMPO,P_COUNT } PanelId;
typedef enum { E_DOWN=1,E_UP,E_TURN,E_XY,E_CANCEL } PanelKind;
typedef struct { uint32_t ms; uint8_t kind,id; int16_t a,b; } PanelEvent;
#define PANEL_QUEUE 64u
#define PANEL_DEBOUNCE_MS 12u
typedef struct { PanelEvent queue[PANEL_QUEUE]; uint32_t changed[P_COUNT]; uint8_t raw[P_COUNT],stable[P_COUNT]; uint8_t read,write,count; bool overflow; } PanelInput;
void panel_input_init(PanelInput *p);
void panel_input_switch(PanelInput *p, PanelId id, bool pressed, uint32_t ms);
void panel_input_turn(PanelInput *p, PanelId id, int16_t steps, uint32_t ms);
void panel_input_xy(PanelInput *p, uint16_t x, uint16_t y, uint32_t ms);
bool panel_input_pop(PanelInput *p, PanelEvent *out, uint32_t ms);
#endif
