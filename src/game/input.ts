export const inputState = {
  gas: false,
  brake: false,
};

let initialized = false;

export function initInput() {
  if (initialized) return;
  initialized = true;

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') inputState.gas = true;
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') inputState.brake = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') inputState.gas = false;
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') inputState.brake = false;
  });
}

export function setButtonInput(type: 'gas' | 'brake', active: boolean) {
  inputState[type] = active;
}
