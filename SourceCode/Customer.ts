namespace game {
    import f = FudgeCore;

    export enum ACTION {
        ENTERING, WAITING_HAPPY, WAITING_ANGRY, LEAVING
    }

    export class Customer extends GameObject {

        public order: number[] = [];
        public posTarget: f.Vector3;
        public patience: number = customerTime;
        public failed: boolean = false;
        public successful: boolean = false;
        public mood: GameObject = new GameObject("Mood", new f.Vector2(0.4, 0.5), f.Vector3.Y(1.5), f.Vector3.ZERO());
        public cmpAudAngry: f.ComponentAudio = new f.ComponentAudio(new f.Audio("../Assets/Customer_Angry.wav"), false, false);
        public cmpAudGrunt: f.ComponentAudio = new f.ComponentAudio(new f.Audio("../Assets/Customer_Grunt.wav"), false, false);
        public cmpAudDeny: f.ComponentAudio = new f.ComponentAudio(new f.Audio("../Assets/Customer_Deny.wav"), false, false);
        public cmpAudAccept: f.ComponentAudio = new f.ComponentAudio(new f.Audio("../Assets/Customer_Accept.wav"), false, false);

        public cmpStateMachine: ComponentStateMachineCustomer;


        public constructor(_size: f.Vector2, _position: f.Vector3, _rotation: f.Vector3, _material: f.Material) {
            super("Customer", _size, _position, _rotation);

            let cmpMaterial: f.ComponentMaterial = new f.ComponentMaterial(_material);
            cmpMaterial.pivot.scale(f.Vector2.ONE(1));
            this.addComponent(cmpMaterial);

            this.addChild(this.mood);
            this.addComponent(this.cmpAudAngry);
            this.addComponent(this.cmpAudGrunt);
            this.addComponent(this.cmpAudDeny);
            this.addComponent(this.cmpAudAccept);

            // generates random order:
            for (let i: number = 0; i < 4; i++) {
                let randomOption: number = Math.floor(Math.random() * 4 + 1);
                this.order[i] = randomOption;
            }

            this.cmpStateMachine = new ComponentStateMachineCustomer();
            this.addComponent(this.cmpStateMachine);
            this.cmpStateMachine.stateCurrent = ACTION.ENTERING;
        }


        public update(): void {
            this.getComponent(ComponentStateMachineCustomer).act();
        }

        public enter(): void {
            this.mtxLocal.translateX(2 * f.Loop.timeFrameGame / 1000);
        }

        public leave(): void {
            this.mtxLocal.translateX(-2 * f.Loop.timeFrameGame / 1000);
        }

        public delete(): void {
            this.removeComponent(this.cmpStateMachine);
            if (this != undefined && this.getParent() != null)
                this.getParent().removeChild(this);
        }

        public showOrder(): void {
            this.cmpAudAccept.play(true);
            document.getElementById("order").setAttribute("style", "visibility: visible");
            document.getElementById("orderFur").innerHTML = "" + this.order[0];
            document.getElementById("orderEyecolor").innerHTML = "" + this.order[1];
            document.getElementById("orderAccessory").innerHTML = "" + this.order[2];
            document.getElementById("orderSound").innerHTML = "" + this.order[3];
        }

        public checkOrder(_teddyBear: TeddyBear): boolean {
            if ("Fur_" + this.order[0] != _teddyBear.fur.name)
                return false;
            if ("Eyecolor_" + this.order[1] != _teddyBear.eyecolor.name)
                return false;
            if ("Accessory_" + this.order[2] != _teddyBear.accessory.name)
                return false;
            if ("Sound_" + this.order[3] != _teddyBear.sound.name)
                return false;
            this.rollBoosterChance();
            this.successful = true;
            this.updateScore();
            return true;
        }

        public updateScore(): void {
            document.getElementById("currentScore").innerHTML = "" + (money * 2 + succOrders - failOrders + difficulty * 10) * 100;
        }

        private rollBoosterChance(): void {
            for (let i: number = 0; i < 4; i++) {
                let randomNumber: number = Math.floor(Math.random() * 4 + 1);
                if (!collectedBooster && randomNumber == 4) {
                    collectedBooster = true;
                    (<HTMLImageElement>document.getElementById("boosterImg")).src = "../Assets/Booster.png";
                }
            }
        }

    }
}