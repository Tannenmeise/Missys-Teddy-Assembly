namespace game {
    import f = FudgeCore;

    export class GameObject extends f.Node {
        private static readonly meshQuad: f.MeshSprite = new f.MeshSprite();
        public mtxPivot: f.Matrix4x4;
        public mtxPivotInverse: f.Matrix4x4;
        public mtxComplete: f.Matrix4x4;
        public mtxCompleteInverse: f.Matrix4x4;

        public constructor(_name: string, _size: f.Vector2, _position: f.Vector3, _rotation: f.Vector3) {
            super(_name);
            this.addComponent(new f.ComponentTransform(f.Matrix4x4.TRANSLATION(_position)));
            this.mtxLocal.rotation = _rotation;

            let cmpQuad: f.ComponentMesh = new f.ComponentMesh(GameObject.meshQuad);
            this.addComponent(cmpQuad);
            cmpQuad.pivot.scale(_size.toVector3(1));

            this.mtxPivot = this.getComponent(f.ComponentMesh).pivot;
        }

        public calculateBounce(_posWith: f.Vector3, _radius: number = 1): f.Vector3 {
            // make sure inversions exist
            this.calculatePivotInverse();
            this.calculateCompleteAndInverse();

            // transform position and radius to mesh coordinates
            let posLocal: f.Vector3 = f.Vector3.TRANSFORMATION(_posWith, this.mtxCompleteInverse, true);
            let vctRadiusLocal: f.Vector3 = f.Vector3.TRANSFORMATION(f.Vector3.X(_radius), this.mtxPivotInverse);

            // if behind mesh or further away than radius. Prerequisite: pivot.z of this object hasn't been scaled!!
            if (posLocal.z < 0 || posLocal.z > _radius)
                return null;

            // if further to the side than 0.5 (the half of the width of the mesh) plus the transformed radius
            if (Math.abs(posLocal.x) > 0.5 + vctRadiusLocal.x)
                return null;

            // bounce in system local to mesh
            posLocal.z = _radius * 1.001;

            // transform back to world system
            posLocal.transform(this.mtxComplete, true);

            return posLocal;
        }

        private calculatePivotInverse(): void {
            if (this.mtxPivotInverse) return;
            this.mtxPivotInverse = f.Matrix4x4.INVERSION(this.mtxPivot);
        }

        private calculateCompleteAndInverse(): void {
            if (this.mtxComplete) return;
            this.mtxComplete = f.Matrix4x4.MULTIPLICATION(this.mtxWorld, this.mtxPivot);
            this.mtxCompleteInverse = f.Matrix4x4.MULTIPLICATION(this.mtxPivotInverse, this.mtxWorldInverse);
        }
    }
}