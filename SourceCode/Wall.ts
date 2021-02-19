namespace game {
    import f = FudgeCore;

    export class Wall extends GameObject {

        public constructor(_size: f.Vector2, _position: f.Vector3, _rotation: f.Vector3, _material?: f.Material) {
            super("Wall", _size, _position, _rotation);

            if (_material != null) {
                let cmpMaterial: f.ComponentMaterial = new f.ComponentMaterial(_material);
                cmpMaterial.pivot.scale(f.Vector2.ONE(1));
                this.addComponent(cmpMaterial);
            }
        }
    }
}