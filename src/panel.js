

import {
  createSystem,
  PanelUI,
  PanelDocument,
  eq,
  VisibilityState,
  Interactable
} from '@iwsdk/core';

export class PanelSystem extends createSystem({
  welcomePanel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', '/ui/welcome.json')]
  },
  spatialIntroPanel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', '/ui/intro-spatial.json')]
  }
}) {
  init() {
    this.queries.welcomePanel.subscribe('qualify', (entity) => {
      const document = PanelDocument.data.document[entity.index];
      if (!document) return;

      const xrButton = document.getElementById('xr-button');
      xrButton.addEventListener('click', () => {
        if (this.world.visibilityState.value === VisibilityState.NonImmersive) {
          this.world.launchXR();
        } else {
          this.world.exitXR();
        }
      });
      this.world.visibilityState.subscribe((visibilityState) => {
        if (visibilityState === VisibilityState.NonImmersive) {
          xrButton.setProperties({ text: 'Enter XR' });
        } else {
          xrButton.setProperties({ text: 'Exit to Browser' });
        }
      });
    });
    // Spatial Intro Panel logic
    this.queries.spatialIntroPanel.subscribe('qualify', (entity) => {
      const document = PanelDocument.data.document[entity.index];
      if (!document) return;

      const continueBtn = document.getElementById('spatial-intro-continue');
      if (continueBtn) {
        continueBtn.addEventListener('click', () => {
          console.log('Continue button clicked');
          
          // Hide the spatial intro panel when continue is pressed
          entity.removeComponent(PanelUI);
          
          // Show the task panel
          const task1Panel = this.world.task1Panel;
          if (task1Panel) {
            console.log('Showing task panel');
            task1Panel.object3D.visible = true;
            task1Panel
              .addComponent(PanelUI, { config: '/ui/task1.json', maxHeight: 0.8, maxWidth: 0.8 })
              .addComponent(Interactable);

            // Reveal task furniture when the panel appears
            const { plantEntity, televisionEntity, couchEntity } = this.world;
            [plantEntity, televisionEntity, couchEntity].forEach((entity) => {
              if (entity && entity.object3D) {
                entity.object3D.visible = true;
              }
            });
          } else {
            console.error('task1Panel not found on world');
          }
        });
      } else {
        console.error('Continue button not found');
      }
    });
  }
}
