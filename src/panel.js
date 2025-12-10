

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
            const { plantEntity, televisionEntity, couchEntity, plantLabel, tvLabel, couchLabel } = this.world;
            
            console.log('Attempting to reveal furniture and labels:', {
              plantEntity, televisionEntity, couchEntity, plantLabel, tvLabel, couchLabel
            });
            
            [plantEntity, televisionEntity, couchEntity].forEach((entity) => {
              if (entity && entity.object3D) {
                entity.object3D.visible = true;
                console.log('Furniture visible:', entity);
              }
            });
            
            // Also reveal the Spanish word labels
            [plantLabel, tvLabel, couchLabel].forEach((label, index) => {
              if (label && label.object3D) {
                console.log(`Setting label ${index} visible. Current state:`, {
                  visible: label.object3D.visible,
                  position: label.object3D.position,
                  scale: label.object3D.scale
                });
                label.object3D.visible = true;
                console.log(`Spanish label ${index} made visible. New state:`, label.object3D.visible);
              } else {
                console.warn(`Spanish label ${index} not found or missing object3D`, label);
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
