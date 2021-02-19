namespace game {
    import f = FudgeCore;
    import faid = FudgeAid;

    export class ComponentStateMachineCustomer extends faid.ComponentStateMachine<ACTION> {
        private static instructions: faid.StateMachineInstructions<ACTION> = ComponentStateMachineCustomer.setupStateMachine();

        public constructor() {
            super();
            this.instructions = ComponentStateMachineCustomer.instructions;
        }

        private static setupStateMachine(): faid.StateMachineInstructions<ACTION> {
            let setup: faid.StateMachineInstructions<ACTION> = new faid.StateMachineInstructions();

            setup.setAction(ACTION.ENTERING, (_machine) => {
                let container: Customer = <Customer>(<faid.ComponentStateMachine<ACTION>>_machine).getContainer();
                if (container.mtxLocal.translation.equals(container.posTarget, 0.5))
                    _machine.transit(ACTION.WAITING_HAPPY);
                container.enter();
            });

            setup.setTransition(ACTION.ENTERING, ACTION.WAITING_HAPPY, (_machine) => { // displays happy mood
                let container: Customer = <Customer>(<faid.ComponentStateMachine<ACTION>>_machine).getContainer();

<<<<<<< HEAD:game/SourceCode/StateMachineCustomer.ts
                let txtMood: f.TextureImage = new f.TextureImage("../Assets/Customer_Mood_Happy.png");
=======
                let txtMood: f.TextureImage = new f.TextureImage("/game/Assets/Customer_Mood_Happy.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/StateMachineCustomer.ts
                let mtrMood: f.Material = new f.Material("Mood", f.ShaderTexture, new f.CoatTextured(clrWhite, txtMood));
                let cmpMtrMood: f.ComponentMaterial = new f.ComponentMaterial(mtrMood);
                container.mood.addComponent(cmpMtrMood);
            });

            setup.setAction(ACTION.WAITING_HAPPY, (_machine) => {
                let container: Customer = <Customer>(<faid.ComponentStateMachine<ACTION>>_machine).getContainer();
                f.Time.game.setTimer(container.patience * 0.9, 1, (_event: f.EventTimer) => {
                    _machine.transit(ACTION.WAITING_ANGRY);
                });
            });

            setup.setTransition(ACTION.WAITING_HAPPY, ACTION.WAITING_ANGRY, (_machine) => { // displays angry mood
                let container: Customer = <Customer>(<faid.ComponentStateMachine<ACTION>>_machine).getContainer();
                
                container.mood.removeComponent(container.mood.getComponent(f.ComponentMaterial));

<<<<<<< HEAD:game/SourceCode/StateMachineCustomer.ts
                let txtMood: f.TextureImage = new f.TextureImage("../Assets/Customer_Mood_Angry.png");
=======
                let txtMood: f.TextureImage = new f.TextureImage("/game/Assets/Customer_Mood_Angry.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/StateMachineCustomer.ts
                let mtrMood: f.Material = new f.Material("Mood", f.ShaderTexture, new f.CoatTextured(clrWhite, txtMood));
                let cmpMtrMood: f.ComponentMaterial = new f.ComponentMaterial(mtrMood);
                container.mood.addComponent(cmpMtrMood);

                container.cmpAudAngry.play(true);
            });

            setup.setAction(ACTION.WAITING_ANGRY, (_machine) => {
                let container: Customer = <Customer>(<faid.ComponentStateMachine<ACTION>>_machine).getContainer();
                f.Time.game.setTimer(container.patience * 0.1, 1, (_event: f.EventTimer) => {
                    _machine.transit(ACTION.LEAVING);
                });
            });

            setup.setTransition(ACTION.WAITING_ANGRY, ACTION.LEAVING, (_machine) => { // made changes, because it gets called several times instead of just once
                let container: Customer = <Customer>(<faid.ComponentStateMachine<ACTION>>_machine).getContainer();
                if (container.failed == false && container.successful == false) {
                    container.cmpAudGrunt.play(true);
                    container.mood.removeComponent(container.mood.getComponent(f.ComponentMaterial)); // deletes mood
                    failOrders++;
                    container.failed = true;
                    container.updateScore();
                }
            });

            setup.setAction(ACTION.LEAVING, (_machine) => {
                let container: Customer = <Customer>(<faid.ComponentStateMachine<ACTION>>_machine).getContainer();
                f.Time.game.setTimer(800, 1, (_event: f.EventTimer) => {
                    if (container.mtxLocal.translation.equals(new f.Vector3(-10.5, 1, -10), 0.5))
                        container.delete();
                    container.leave();
                });
            });

            return setup;
        }
    }
}