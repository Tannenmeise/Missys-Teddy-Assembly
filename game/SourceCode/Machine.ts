namespace game {
    import f = FudgeCore;

    export enum STATE {
        FREE, WAITING, WORKING, FINISHED
    }

    export class Machine extends GameObject {

        public index: number;
        public productionTime: number = machineTime;
<<<<<<< HEAD:game/SourceCode/Machine.ts
        public cmpAudWorking: f.ComponentAudio = new f.ComponentAudio(new f.Audio("../Assets/Machine_Working.wav"), true, false);
        public cmpAudFinished: f.ComponentAudio = new f.ComponentAudio(new f.Audio("../Assets/Machine_Finished.wav"), false, false);
=======
        public cmpAudWorking: f.ComponentAudio = new f.ComponentAudio(new f.Audio("/game/Assets/Machine_Working.wav"), true, false);
        public cmpAudFinished: f.ComponentAudio = new f.ComponentAudio(new f.Audio("/game/Assets/Machine_Finished.wav"), false, false);
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Machine.ts
        public cmpStateMachine: ComponentStateMachineMachine;


        public constructor(_name: string, _size: f.Vector2, _position: f.Vector3, _rotation: f.Vector3, _material: f.Material) {
            super(_name, _size, _position, _rotation);

            let cmpMaterial: f.ComponentMaterial = new f.ComponentMaterial(_material);
            cmpMaterial.pivot.scale(f.Vector2.ONE(1));
            this.addComponent(cmpMaterial);

            this.addComponent(this.cmpAudWorking);
            this.addComponent(this.cmpAudFinished);

            this.cmpStateMachine = new ComponentStateMachineMachine();
            this.addComponent(this.cmpStateMachine);

            if (this.name == "Machine_1") {
                this.index = 0;
                this.cmpStateMachine.stateCurrent = STATE.WAITING;
            }
            if (this.name == "Machine_2") {
                this.index = 1;
                this.cmpStateMachine.stateCurrent = STATE.FREE;
            }
            if (this.name == "Machine_3") {
                this.index = 2;
                this.cmpStateMachine.stateCurrent = STATE.FREE;
            }
            if (this.name == "Machine_4") {
                this.index = 3;
                this.cmpStateMachine.stateCurrent = STATE.FREE;
            }
            
        }


        public update(): void {
            this.getComponent(ComponentStateMachineMachine).act();
        }


        public resetTo(_state: STATE): void {
            // states:
            this.removeComponent(this.cmpStateMachine);
            this.cmpStateMachine = new ComponentStateMachineMachine();
            this.addComponent(this.cmpStateMachine);
            this.cmpStateMachine.stateCurrent = _state;
            // audio:
            this.removeComponent(this.cmpAudWorking);
            this.removeComponent(this.cmpAudFinished);
            this.addComponent(this.cmpAudWorking);
            this.addComponent(this.cmpAudFinished);
        }

    }
}