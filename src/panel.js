

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
  },
  task1Panel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', '/ui/task1.json')]
  },
  task2Panel: {
    required: [PanelUI, PanelDocument],
    where: [eq(PanelUI, 'config', '/ui/task2.json')]
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
    
    // Task1 Panel logic - handle continue button
    this.queries.task1Panel.subscribe('qualify', (entity) => {
      const document = PanelDocument.data.document[entity.index];
      if (!document) return;

      const task1ContinueBtn = document.getElementById('task1-continue');
      if (task1ContinueBtn) {
        task1ContinueBtn.addEventListener('click', () => {
          console.log('Task1 Continue button clicked');
          
          // Hide task1 panel
          entity.removeComponent(PanelUI);
          entity.object3D.visible = false;
          
          // Reposition Spanish labels to the side of furniture and make them interactable
          const { plantLabel, tvLabel, couchLabel } = this.world;
          
          // Plant label - move to the right side of plant
          if (plantLabel && plantLabel.object3D) {
            plantLabel.object3D.position.set(0.7, 1.5, -1.1);
            plantLabel.object3D.visible = true;
          }
          
          // TV label - move to the right side of TV
          if (tvLabel && tvLabel.object3D) {
            tvLabel.object3D.position.set(0.7, 1.3, -1.1);
            tvLabel.object3D.visible = true;
          }
          
          // Couch label - move to the right side of couch
          if (couchLabel && couchLabel.object3D) {
            couchLabel.object3D.position.set(0.7, 1.7, -1.1);
            couchLabel.object3D.visible = true;
          }
          
          // Show task2 panel
          const task2Panel = this.world.task2Panel;
          if (task2Panel) {
            console.log('Showing task2 panel');
            task2Panel.object3D.visible = true;
            task2Panel
              .addComponent(PanelUI, { config: '/ui/task2.json', maxHeight: 0.8, maxWidth: 0.8 })
              .addComponent(Interactable);
          } else {
            console.error('task2Panel not found on world');
          }
        });
      }
    });
    
    // Task2 Panel logic - handle back button
    this.queries.task2Panel.subscribe('qualify', (entity) => {
      const document = PanelDocument.data.document[entity.index];
      if (!document) return;

      const task2BackBtn = document.getElementById('task2-back');
      if (task2BackBtn) {
        task2BackBtn.addEventListener('click', () => {
          console.log('Task2 Back button clicked');
          
          // Hide task2 panel
          entity.removeComponent(PanelUI);
          entity.object3D.visible = false;
          
          // Show task1 panel again
          const task1Panel = this.world.task1Panel;
          if (task1Panel) {
            console.log('Showing task1 panel again');
            task1Panel.object3D.visible = true;
            task1Panel
              .addComponent(PanelUI, { config: '/ui/task1.json', maxHeight: 0.8, maxWidth: 0.8 })
              .addComponent(Interactable);
          } else {
            console.error('task1Panel not found on world');
          }
        });
      }
    });
  }
}
