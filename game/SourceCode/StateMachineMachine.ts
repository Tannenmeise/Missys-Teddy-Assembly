namespace game {
    import f = FudgeCore;
    import faid = FudgeAid;

    export class ComponentStateMachineMachine extends faid.ComponentStateMachine<STATE> {
        private static instructions: faid.StateMachineInstructions<STATE> = ComponentStateMachineMachine.setupStateMachine();

        public constructor() {
            super();
            this.instructions = ComponentStateMachineMachine.instructions;
        }

        private static setupStateMachine(): faid.StateMachineInstructions<STATE> {
            let setup: faid.StateMachineInstructions<STATE> = new faid.StateMachineInstructions();

            setup.setAction(STATE.FREE, (_machine) => {
                // waiting for teddy
            });

            setup.setAction(STATE.WAITING, (_machine) => {
                // waiting for user input
            });

            setup.setAction(STATE.WORKING, (_machine) => {
                let container: Machine = <Machine>(<faid.ComponentStateMachine<STATE>>_machine).getContainer();
                if (!container.cmpAudWorking.isPlaying)
                    container.cmpAudWorking.play(true);
                f.Time.game.setTimer(container.productionTime, 1, (_event: f.EventTimer) => {
                    _machine.transit(STATE.FINISHED);
                });
            });

            setup.setTransition(STATE.WORKING, STATE.FINISHED, (_machine) => {
                let container: Machine = <Machine>(<faid.ComponentStateMachine<STATE>>_machine).getContainer();
                container.cmpAudWorking.play(false);
                container.cmpAudFinished.play(true);
            });

            setup.setAction(STATE.FINISHED, (_machine) => {
                let container: Machine = <Machine>(<faid.ComponentStateMachine<STATE>>_machine).getContainer();
                if (container.name != "Machine_4") {
                    let nextMachine: Machine = <Machine>container.getParent().getChild((container.index + 1));
                    if (nextMachine.cmpStateMachine.stateCurrent == STATE.FREE) {
                        nextMachine.appendChild(container.getChild(2));
                        nextMachine.cmpStateMachine.stateCurrent = STATE.WAITING;
                        if (container.name == "Machine_1") {
                            container.resetTo(STATE.WAITING);
                            //_machine.transit(STATE.WAITING); // doesn't work?! -> machines get stuck in state 3 because of that
                        } else {
                            container.resetTo(STATE.FREE);
                            //_machine.transit(STATE.FREE); // doesn't work?! -> machines get stuck in state 3 because of that
                        }
                    }
                } else {
                    if (container.getChild(2) == undefined)
                        container.resetTo(STATE.FREE);
                        //_machine.transit(STATE.FREE); // doesn't work?! -> machines get stuck in state 3 because of that
                }

            });

            return setup;
        }
    }
}