namespace game {
    import f = FudgeCore;

    const clrWhite: f.Color = f.Color.CSS("white");

    export class TeddyBear extends GameObject {

        public fur: f.Node;
        public eyecolor: GameObject;
        public accessory: GameObject;
        public sound: f.Node;
        public progress: number;


        public constructor(_size: f.Vector2, _position: f.Vector3, _rotation: f.Vector3, _option: number) {
            super("TeddyBear", _size, _position, _rotation);

            this.fur = new f.Node("Fur_" + _option);
<<<<<<< HEAD:game/SourceCode/TeddyBear.ts
            let txtTeddyBear: f.TextureImage = new f.TextureImage("../Assets/Fur_" + _option + ".png");
=======
            let txtTeddyBear: f.TextureImage = new f.TextureImage("/game/Assets/Fur_" + _option + ".png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/TeddyBear.ts
            let mtrTeddyBear: f.Material = new f.Material("Fur", f.ShaderTexture, new f.CoatTextured(clrWhite, txtTeddyBear));
            let cmpMaterial: f.ComponentMaterial = new f.ComponentMaterial(mtrTeddyBear);
            cmpMaterial.pivot.scale(f.Vector2.ONE(1));
            this.addComponent(cmpMaterial);

            this.progress = 1;
        }


        public addEyecolor(_option: number): void {
            this.eyecolor = new GameObject("Eyecolor_" + _option, new f.Vector2(0.118, 0.026), new f.Vector3(0.007, 0.1, 0.001), f.Vector3.ZERO());
<<<<<<< HEAD:game/SourceCode/TeddyBear.ts
            let txtEyecolor: f.TextureImage = new f.TextureImage("../Assets/Eyecolor_" + _option + ".png");
=======
            let txtEyecolor: f.TextureImage = new f.TextureImage("/game/Assets/Eyecolor_" + _option + ".png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/TeddyBear.ts
            let mtrEyecolor: f.Material = new f.Material("Eyecolor", f.ShaderTexture, new f.CoatTextured(clrWhite, txtEyecolor));
            let cmpMtrEyecolor: f.ComponentMaterial = new f.ComponentMaterial(mtrEyecolor);
            this.eyecolor.addComponent(cmpMtrEyecolor);
            this.appendChild(this.eyecolor);
            this.progress++;
        }


        public addAccessory(_option: number): void {
            this.accessory = new GameObject("Accessory_" + _option, new f.Vector2(0.1842, 0.125), new f.Vector3(0, -0.042, 0.001), f.Vector3.ZERO());
<<<<<<< HEAD:game/SourceCode/TeddyBear.ts
            let txtAccessory: f.TextureImage = new f.TextureImage("../Assets/Accessory_" + _option + ".png");
=======
            let txtAccessory: f.TextureImage = new f.TextureImage("/game/Assets/Accessory_" + _option + ".png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/TeddyBear.ts
            let mtrAccessory: f.Material = new f.Material("Accessory", f.ShaderTexture, new f.CoatTextured(clrWhite, txtAccessory));
            let cmpMtrAccessory: f.ComponentMaterial = new f.ComponentMaterial(mtrAccessory);
            this.accessory.addComponent(cmpMtrAccessory);
            this.appendChild(this.accessory);
            this.progress++;
        }


        public addSound(_option: number): void {
            this.sound = new f.Node("Sound_" + _option);
<<<<<<< HEAD:game/SourceCode/TeddyBear.ts
            let cmpAudio: f.ComponentAudio = new f.ComponentAudio(new f.Audio("../Assets/Sound_" + _option + ".wav"), false, true);
=======
            let cmpAudio: f.ComponentAudio = new f.ComponentAudio(new f.Audio("/game/Assets/Sound_" + _option + ".wav"), false, true);
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/TeddyBear.ts
            this.sound.addComponent(cmpAudio);
            this.appendChild(this.sound);
            this.progress++;
        }

    }
}