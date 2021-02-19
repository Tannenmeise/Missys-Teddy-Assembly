"use strict";
var game;
(function (game) {
    var f = FudgeCore;
    let GameObject = /** @class */ (() => {
        class GameObject extends f.Node {
            constructor(_name, _size, _position, _rotation) {
                super(_name);
                this.addComponent(new f.ComponentTransform(f.Matrix4x4.TRANSLATION(_position)));
                this.mtxLocal.rotation = _rotation;
                let cmpQuad = new f.ComponentMesh(GameObject.meshQuad);
                this.addComponent(cmpQuad);
                cmpQuad.pivot.scale(_size.toVector3(1));
                this.mtxPivot = this.getComponent(f.ComponentMesh).pivot;
            }
            calculateBounce(_posWith, _radius = 1) {
                // make sure inversions exist
                this.calculatePivotInverse();
                this.calculateCompleteAndInverse();
                // transform position and radius to mesh coordinates
                let posLocal = f.Vector3.TRANSFORMATION(_posWith, this.mtxCompleteInverse, true);
                let vctRadiusLocal = f.Vector3.TRANSFORMATION(f.Vector3.X(_radius), this.mtxPivotInverse);
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
            calculatePivotInverse() {
                if (this.mtxPivotInverse)
                    return;
                this.mtxPivotInverse = f.Matrix4x4.INVERSION(this.mtxPivot);
            }
            calculateCompleteAndInverse() {
                if (this.mtxComplete)
                    return;
                this.mtxComplete = f.Matrix4x4.MULTIPLICATION(this.mtxWorld, this.mtxPivot);
                this.mtxCompleteInverse = f.Matrix4x4.MULTIPLICATION(this.mtxPivotInverse, this.mtxWorldInverse);
            }
        }
        GameObject.meshQuad = new f.MeshSprite();
        return GameObject;
    })();
    game.GameObject = GameObject;
})(game || (game = {}));
/// <reference path = "GameObject.ts"/>
var game;
/// <reference path = "GameObject.ts"/>
(function (game) {
    var f = FudgeCore;
    class Counter extends game.GameObject {
        constructor(_size, _position, _rotation, _material) {
            super("Counter", _size, _position, _rotation);
            let cmpMaterial = new f.ComponentMaterial(_material);
            cmpMaterial.pivot.scale(f.Vector2.ONE(1));
            this.addComponent(cmpMaterial);
        }
    }
    game.Counter = Counter;
})(game || (game = {}));
var game;
(function (game) {
    var f = FudgeCore;
    let ACTION;
    (function (ACTION) {
        ACTION[ACTION["ENTERING"] = 0] = "ENTERING";
        ACTION[ACTION["WAITING_HAPPY"] = 1] = "WAITING_HAPPY";
        ACTION[ACTION["WAITING_ANGRY"] = 2] = "WAITING_ANGRY";
        ACTION[ACTION["LEAVING"] = 3] = "LEAVING";
    })(ACTION = game.ACTION || (game.ACTION = {}));
    class Customer extends game.GameObject {
        constructor(_size, _position, _rotation, _material) {
            super("Customer", _size, _position, _rotation);
            this.order = [];
            this.patience = game.customerTime;
            this.failed = false;
            this.successful = false;
            this.mood = new game.GameObject("Mood", new f.Vector2(0.4, 0.5), f.Vector3.Y(1.5), f.Vector3.ZERO());
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
            this.cmpAudAngry = new f.ComponentAudio(new f.Audio("../Assets/Customer_Angry.wav"), false, false);
            this.cmpAudGrunt = new f.ComponentAudio(new f.Audio("../Assets/Customer_Grunt.wav"), false, false);
            this.cmpAudDeny = new f.ComponentAudio(new f.Audio("../Assets/Customer_Deny.wav"), false, false);
            this.cmpAudAccept = new f.ComponentAudio(new f.Audio("../Assets/Customer_Accept.wav"), false, false);
=======
            this.cmpAudAngry = new f.ComponentAudio(new f.Audio("/game/Assets/Customer_Angry.wav"), false, false);
            this.cmpAudGrunt = new f.ComponentAudio(new f.Audio("/game/Assets/Customer_Grunt.wav"), false, false);
            this.cmpAudDeny = new f.ComponentAudio(new f.Audio("/game/Assets/Customer_Deny.wav"), false, false);
            this.cmpAudAccept = new f.ComponentAudio(new f.Audio("/game/Assets/Customer_Accept.wav"), false, false);
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
            let cmpMaterial = new f.ComponentMaterial(_material);
            cmpMaterial.pivot.scale(f.Vector2.ONE(1));
            this.addComponent(cmpMaterial);
            this.addChild(this.mood);
            this.addComponent(this.cmpAudAngry);
            this.addComponent(this.cmpAudGrunt);
            this.addComponent(this.cmpAudDeny);
            this.addComponent(this.cmpAudAccept);
            // generates random order:
            for (let i = 0; i < 4; i++) {
                let randomOption = Math.floor(Math.random() * 4 + 1);
                this.order[i] = randomOption;
            }
            this.cmpStateMachine = new game.ComponentStateMachineCustomer();
            this.addComponent(this.cmpStateMachine);
            this.cmpStateMachine.stateCurrent = ACTION.ENTERING;
        }
        update() {
            this.getComponent(game.ComponentStateMachineCustomer).act();
        }
        enter() {
            this.mtxLocal.translateX(2 * f.Loop.timeFrameGame / 1000);
        }
        leave() {
            this.mtxLocal.translateX(-2 * f.Loop.timeFrameGame / 1000);
        }
        delete() {
            this.removeComponent(this.cmpStateMachine);
            if (this != undefined && this.getParent() != null)
                this.getParent().removeChild(this);
        }
        showOrder() {
            this.cmpAudAccept.play(true);
            document.getElementById("order").setAttribute("style", "visibility: visible");
            document.getElementById("orderFur").innerHTML = "" + this.order[0];
            document.getElementById("orderEyecolor").innerHTML = "" + this.order[1];
            document.getElementById("orderAccessory").innerHTML = "" + this.order[2];
            document.getElementById("orderSound").innerHTML = "" + this.order[3];
        }
        checkOrder(_teddyBear) {
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
        updateScore() {
            document.getElementById("currentScore").innerHTML = "" + (game.money * 2 + game.succOrders - game.failOrders + game.difficulty * 10) * 100;
        }
        rollBoosterChance() {
            for (let i = 0; i < 4; i++) {
                let randomNumber = Math.floor(Math.random() * 4 + 1);
                if (!game.collectedBooster && randomNumber == 4) {
                    game.collectedBooster = true;
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
                    document.getElementById("boosterImg").src = "../Assets/Booster.png";
=======
                    document.getElementById("boosterImg").src = "/game/Assets/Booster.png";
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
                }
            }
        }
    }
    game.Customer = Customer;
})(game || (game = {}));
var game;
(function (game) {
})(game || (game = {}));
var game;
(function (game) {
    var f = FudgeCore;
    let STATE;
    (function (STATE) {
        STATE[STATE["FREE"] = 0] = "FREE";
        STATE[STATE["WAITING"] = 1] = "WAITING";
        STATE[STATE["WORKING"] = 2] = "WORKING";
        STATE[STATE["FINISHED"] = 3] = "FINISHED";
    })(STATE = game.STATE || (game.STATE = {}));
    class Machine extends game.GameObject {
        constructor(_name, _size, _position, _rotation, _material) {
            super(_name, _size, _position, _rotation);
            this.productionTime = game.machineTime;
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
            this.cmpAudWorking = new f.ComponentAudio(new f.Audio("../Assets/Machine_Working.wav"), true, false);
            this.cmpAudFinished = new f.ComponentAudio(new f.Audio("../Assets/Machine_Finished.wav"), false, false);
=======
            this.cmpAudWorking = new f.ComponentAudio(new f.Audio("/game/Assets/Machine_Working.wav"), true, false);
            this.cmpAudFinished = new f.ComponentAudio(new f.Audio("/game/Assets/Machine_Finished.wav"), false, false);
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
            let cmpMaterial = new f.ComponentMaterial(_material);
            cmpMaterial.pivot.scale(f.Vector2.ONE(1));
            this.addComponent(cmpMaterial);
            this.addComponent(this.cmpAudWorking);
            this.addComponent(this.cmpAudFinished);
            this.cmpStateMachine = new game.ComponentStateMachineMachine();
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
        update() {
            this.getComponent(game.ComponentStateMachineMachine).act();
        }
        resetTo(_state) {
            // states:
            this.removeComponent(this.cmpStateMachine);
            this.cmpStateMachine = new game.ComponentStateMachineMachine();
            this.addComponent(this.cmpStateMachine);
            this.cmpStateMachine.stateCurrent = _state;
            // audio:
            this.removeComponent(this.cmpAudWorking);
            this.removeComponent(this.cmpAudFinished);
            this.addComponent(this.cmpAudWorking);
            this.addComponent(this.cmpAudFinished);
        }
    }
    game.Machine = Machine;
})(game || (game = {}));
var game;
(function (game) {
    var f = FudgeCore;
    var faid = FudgeAid;
    let GAMESTATE;
    (function (GAMESTATE) {
        GAMESTATE[GAMESTATE["MENU"] = 0] = "MENU";
        GAMESTATE[GAMESTATE["PLAY"] = 1] = "PLAY";
        GAMESTATE[GAMESTATE["MACHINE"] = 2] = "MACHINE";
        GAMESTATE[GAMESTATE["PAUSE"] = 3] = "PAUSE";
        GAMESTATE[GAMESTATE["END"] = 4] = "END";
    })(GAMESTATE || (GAMESTATE = {}));
    async function communicate(_url) {
        let response1 = await fetch(_url);
        let response2 = await response1.json();
        game.parametersArray = JSON.parse(JSON.stringify(response2));
    }
    window.addEventListener("load", hndLoad);
    let gameState = GAMESTATE.MENU;
    let selectedMachine;
    game.clrWhite = f.Color.CSS("white");
    game.sizeWall = 3;
    game.numWalls = 8;
    game.machineTime = 20000;
    game.customerTime = (game.machineTime + 4000) * 4 * 4;
    game.spawnTime = (game.machineTime + 4000) * 4;
    game.difficulty = 0; // 0: easy, 1: normal, 2: hard
    game.succOrders = 0;
    game.failOrders = 0;
    game.money = 0;
    game.avatar = new f.Node("Avatar");
    game.machines = new f.Node("Machines");
    // #region (AUDIO)
    let head = new f.Node("Head");
    game.avatar.appendChild(head);
    head.addComponent(new f.ComponentTransform());
    head.mtxLocal.translateY(1.7);
    let ears = new f.ComponentAudioListener();
    head.addComponent(ears);
    // #endregion (AUDIO)
    let ctrSpeed = new f.Control("AvatarSpeed", 0.3, 0 /* PROPORTIONAL */);
    ctrSpeed.setDelay(100);
    let ctrStrafe = new f.Control("AvatarSpeed", 0.1, 0 /* PROPORTIONAL */);
    ctrSpeed.setDelay(100);
    let ctrRotation = new f.Control("AvatarRotation", -0.1, 0 /* PROPORTIONAL */);
    ctrRotation.setDelay(100);
    let viewport;
    let root = new f.Node("Root");
    let building = new f.Node("Building");
    root.appendChild(building);
    let walls = new f.Node("Walls");
    let counter = new f.Node("Counter");
    let customers = new f.Node("Customers");
    root.appendChild(customers);
    let trashcan;
    let conveyorBelts = new f.Node("ConveyorBelts");
    let instructions;
    let clockTimer; // for clock
    let clock = 0;
    let endlessMode = false; // false: shift, true: endless
    let customerTimer; // when the next customer will come
    let index = 0;
    let customerPositions;
    // #region (BOOSTER)
    let activeBooster = false;
    game.collectedBooster = false;
    let boosterTimer = new f.Time;
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
    game.boosterSound = new f.ComponentAudio(new f.Audio("../Assets/Booster.wav"), false, false);
    root.addComponent(game.boosterSound);
    // #endregion (BOOSTER)
    let backgroundMusic = new f.ComponentAudio(new f.Audio("../Assets/BackgroundMusic.wav"), true);
    root.addComponent(backgroundMusic);
    let menuMusic = new f.ComponentAudio(new f.Audio("../Assets/MenuMusic.wav"), true, true);
    root.addComponent(menuMusic);
    let newCustomerAud = new f.ComponentAudio(new f.Audio("../Assets/NewCustomer.wav"));
    root.addComponent(newCustomerAud);
    let moneySound = new f.ComponentAudio(new f.Audio("../Assets/Money.wav"), false, false);
    root.addComponent(moneySound);
    let finishSound = new f.ComponentAudio(new f.Audio("../Assets/Finish.wav"), false, false);
    root.addComponent(finishSound);
    async function hndLoad(_event) {
        await communicate("../Difficulties.json");
        const canvas = document.querySelector("canvas");
        let meshQuad = new f.MeshQuad("Quad");
        // #region (ROOM)
        let txtFloor = new f.TextureImage("../Assets/Floor.png");
=======
    game.boosterSound = new f.ComponentAudio(new f.Audio("/game/Assets/Booster.wav"), false, false);
    root.addComponent(game.boosterSound);
    // #endregion (BOOSTER)
    let backgroundMusic = new f.ComponentAudio(new f.Audio("/game/Assets/BackgroundMusic.wav"), true);
    root.addComponent(backgroundMusic);
    let menuMusic = new f.ComponentAudio(new f.Audio("/game/Assets/MenuMusic.wav"), true, true);
    root.addComponent(menuMusic);
    let newCustomerAud = new f.ComponentAudio(new f.Audio("/game/Assets/NewCustomer.wav"));
    root.addComponent(newCustomerAud);
    let moneySound = new f.ComponentAudio(new f.Audio("/game/Assets/Money.wav"), false, false);
    root.addComponent(moneySound);
    let finishSound = new f.ComponentAudio(new f.Audio("/game/Assets/Finish.wav"), false, false);
    root.addComponent(finishSound);
    async function hndLoad(_event) {
        await communicate("/game/Difficulties.json");
        const canvas = document.querySelector("canvas");
        let meshQuad = new f.MeshQuad("Quad");
        // #region (ROOM)
        let txtFloor = new f.TextureImage("/game/Assets/Floor.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
        let mtrFloor = new f.Material("Floor", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtFloor));
        let floor = new faid.Node("Floor", f.Matrix4x4.ROTATION_X(-90), mtrFloor, meshQuad);
        floor.mtxLocal.scale(f.Vector3.ONE(game.sizeWall * game.numWalls));
        floor.getComponent(f.ComponentMaterial).pivot.scale(f.Vector2.ONE(game.numWalls));
        building.appendChild(floor);
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
        let txtCeiling = new f.TextureImage("../Assets/Ceiling.png");
=======
        let txtCeiling = new f.TextureImage("/game/Assets/Ceiling.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
        let mtrCeiling = new f.Material("Floor", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtCeiling));
        let ceiling = new faid.Node("Floor", f.Matrix4x4.TRANSLATION(new f.Vector3(0, game.sizeWall, 0)), mtrCeiling, meshQuad);
        ceiling.mtxLocal.rotateX(90);
        ceiling.mtxLocal.scale(f.Vector3.ONE(game.sizeWall * game.numWalls));
        ceiling.getComponent(f.ComponentMaterial).pivot.scale(f.Vector2.ONE(game.numWalls));
        building.appendChild(ceiling);
        walls = createWalls();
        building.appendChild(walls);
        // #endregion (ROOM)
        counter = createCounter();
        root.appendChild(counter);
        customerPositions = createPositions();
        game.machines = createMachines();
        root.appendChild(game.machines);
        // #region (CASH REGISTER)
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
        let txtCashRegisterBF = new f.TextureImage("../Assets/CashRegister_BaseFront.png");
=======
        let txtCashRegisterBF = new f.TextureImage("/game/Assets/CashRegister_BaseFront.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
        let mtrCashRegisterBF = new f.Material("CashRegister", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtCashRegisterBF));
        let cmpMtrCashRegister = new f.ComponentMaterial(mtrCashRegisterBF);
        let cashRegister = new game.GameObject("CashRegister", new f.Vector2(0.555, 0.138), new f.Vector3(-game.sizeWall * game.numWalls / 2 + 4, 1.069, -8.125), f.Vector3.ONE(0));
        cashRegister.addComponent(cmpMtrCashRegister);
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
        let txtCashRegisterBS = new f.TextureImage("../Assets/CashRegister_BaseSide.png");
=======
        let txtCashRegisterBS = new f.TextureImage("/game/Assets/CashRegister_BaseSide.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
        let mtrCashRegisterBS = new f.Material("CashRegister", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtCashRegisterBS));
        let cashRegisterBL = new game.GameObject("CashRegister", new f.Vector2(0.555, 0.238), new f.Vector3(-0.277, 0.05, -0.277), f.Vector3.Y(90));
        let cmpMtrCashRegisterBL = new f.ComponentMaterial(mtrCashRegisterBS);
        cashRegisterBL.addComponent(cmpMtrCashRegisterBL);
        cashRegister.appendChild(cashRegisterBL);
        let cashRegisterBR = new game.GameObject("CashRegister", new f.Vector2(0.555, 0.238), new f.Vector3(0.277, 0.05, -0.277), f.Vector3.Y(90));
        let cmpMtrCashRegisterBR = new f.ComponentMaterial(mtrCashRegisterBS);
        cashRegisterBR.addComponent(cmpMtrCashRegisterBR);
        cashRegister.appendChild(cashRegisterBR);
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
        let txtCashRegisterBT = new f.TextureImage("../Assets/CashRegister_BaseTop.png");
=======
        let txtCashRegisterBT = new f.TextureImage("/game/Assets/CashRegister_BaseTop.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
        let mtrCashRegisterBT = new f.Material("CashRegister", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtCashRegisterBT));
        let cashRegisterBT = new game.GameObject("CashRegister", new f.Vector2(0.555, 0.555), new f.Vector3(0, 0.116, -0.277), f.Vector3.X(-80));
        let cmpMtrCashRegisterBT = new f.ComponentMaterial(mtrCashRegisterBT);
        cashRegisterBT.addComponent(cmpMtrCashRegisterBT);
        cashRegister.appendChild(cashRegisterBT);
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
        let txtCashRegisterF = new f.TextureImage("../Assets/CashRegister_Front.png");
=======
        let txtCashRegisterF = new f.TextureImage("/game/Assets/CashRegister_Front.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
        let mtrCashRegisterF = new f.Material("CashRegister", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtCashRegisterF));
        let cashRegisterF = new game.GameObject("CashRegister", new f.Vector2(0.555, 0.139), new f.Vector3(0, 0.23, -0.555), f.Vector3.ZERO());
        let cmpMtrCashRegisterF = new f.ComponentMaterial(mtrCashRegisterF);
        cashRegisterF.addComponent(cmpMtrCashRegisterF);
        cashRegister.appendChild(cashRegisterF);
        root.appendChild(cashRegister);
        // #endregion (CASH REGISTER)
        // #region (TRASHCAN)
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
        let txtTrashcan = new f.TextureImage("../Assets/Trashcan_Side.png");
=======
        let txtTrashcan = new f.TextureImage("/game/Assets/Trashcan_Side.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
        let mtrTrashcan = new f.Material("Trashcan", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtTrashcan));
        trashcan = new game.GameObject("Trashcan", new f.Vector2(0.75, 1), new f.Vector3(game.sizeWall * game.numWalls / 2 - 1.5, 0.5, -8), f.Vector3.ZERO());
        let cmpMtrTrashcan = new f.ComponentMaterial(mtrTrashcan);
        trashcan.addComponent(cmpMtrTrashcan);
        let trashcanL = new game.GameObject("Trashcan_l", new f.Vector2(0.75, 1), new f.Vector3(-0.375, 0, -0.375), f.Vector3.Y(-90));
        let cmpMtrTrashcanL = new f.ComponentMaterial(mtrTrashcan);
        trashcanL.addComponent(cmpMtrTrashcanL);
        trashcan.appendChild(trashcanL);
        let trashcanR = new game.GameObject("Trashcan_r", new f.Vector2(0.75, 1), new f.Vector3(0.375, 0, -0.375), f.Vector3.Y(90));
        let cmpMtrTrashcanR = new f.ComponentMaterial(mtrTrashcan);
        trashcanR.addComponent(cmpMtrTrashcanR);
        trashcan.appendChild(trashcanR);
        let trashcanT = new game.GameObject("Trashcan_t", new f.Vector2(0.75, 0.75), new f.Vector3(0, 0.5, -0.375), f.Vector3.X(90));
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
        let txtTrashcanT = new f.TextureImage("../Assets/Trashcan_Top.png");
=======
        let txtTrashcanT = new f.TextureImage("/game/Assets/Trashcan_Top.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
        let mtrTrashcanT = new f.Material("Trashcan", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtTrashcanT));
        let cmpMtrTrashcanT = new f.ComponentMaterial(mtrTrashcanT);
        trashcanT.addComponent(cmpMtrTrashcanT);
        trashcan.appendChild(trashcanT);
        root.appendChild(trashcan);
        // #endregion (TRASHCAN)
        // #region (INSTRUCTIONS)
        instructions = new game.GameObject("Instructions", new f.Vector2(0.6, 1), new f.Vector3(-game.sizeWall * game.numWalls / 2 + 0.001, 1.5, 0), f.Vector3.Y(90));
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
        let txtInstructions = new f.TextureImage("../Assets/Instructions.png");
=======
        let txtInstructions = new f.TextureImage("/game/Assets/Instructions.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
        let mtrInstructions = new f.Material("Instructions", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtInstructions));
        let cmpMtrInstructions = new f.ComponentMaterial(mtrInstructions);
        instructions.addComponent(cmpMtrInstructions);
        root.appendChild(instructions);
        // #endregion (INSTRUCTIONS)
        let cmpCamera = new f.ComponentCamera();
        cmpCamera.projectCentral(1, 45, f.FIELD_OF_VIEW.DIAGONAL, 0.2, 10000);
        cmpCamera.pivot.translate(f.Vector3.Y(1.55)); // ->Augenhöhe des Avatars
        cmpCamera.backgroundColor = f.Color.CSS("purple");
        game.avatar.addComponent(cmpCamera);
        game.avatar.addComponent(new f.ComponentTransform());
        game.avatar.mtxLocal.translate(f.Vector3.Z(9));
        game.avatar.mtxLocal.rotate(f.Vector3.Y(180));
        root.appendChild(game.avatar);
        viewport = new f.Viewport();
        viewport.initialize("Viewport", root, cmpCamera, canvas);
        viewport.draw();
        f.AudioManager.default.listenTo(root);
        f.AudioManager.default.listenWith(game.avatar.getComponent(f.ComponentAudioListener));
        // #region (MENU EVENT LISTENERS)
        document.getElementById("start")?.addEventListener("click", startGame);
        document.getElementById("options")?.addEventListener("click", showOptions);
        document.getElementById("controls")?.addEventListener("click", showControls);
        document.getElementById("difficulty_0")?.addEventListener("click", setDifficulty0);
        document.getElementById("difficulty_1")?.addEventListener("click", setDifficulty1);
        document.getElementById("difficulty_2")?.addEventListener("click", setDifficulty2);
        document.getElementById("mode_0")?.addEventListener("click", setMode0);
        document.getElementById("mode_1")?.addEventListener("click", setMode1);
        // #endregion (MENU EVENT LISTENERS)
        canvas.addEventListener("mousemove", hndMouse);
        canvas.addEventListener("click", canvas.requestPointerLock);
        canvas.addEventListener("click", interact);
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, hndLoop);
        f.Loop.start(f.LOOP_MODE.TIME_GAME, 120);
    }
    function hndLoop(_event) {
        //clock = 5; // to test endscreen
        if (gameState == GAMESTATE.MENU) { // as long as Player is on menu
            return;
        }
        if (gameState == GAMESTATE.END) {
            if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.R])) {
                location.reload();
            }
            return;
        }
        if (gameState == GAMESTATE.PAUSE) {
            if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.SPACE])) {
                document.getElementById("instructions").setAttribute("style", "visibility: hidden");
                gameState = GAMESTATE.PLAY;
            }
            return;
        }
        if (gameState == GAMESTATE.MACHINE) { // as long as Player is on machine
            let pickedOption;
            if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.SPACE])) {
                exitMachine();
            }
            else if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ONE])) {
                pickedOption = 1;
                addAttribute(pickedOption);
                exitMachine();
            }
            else if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.TWO])) {
                pickedOption = 2;
                addAttribute(pickedOption);
                exitMachine();
            }
            else if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.THREE])) {
                pickedOption = 3;
                addAttribute(pickedOption);
                exitMachine();
            }
            else if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.FOUR])) {
                pickedOption = 4;
                addAttribute(pickedOption);
                exitMachine();
            }
            return;
        }
        if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ENTER]))
            document.getElementById("order").setAttribute("style", "visibility: hidden");
        if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.E]))
            hndlBooster();
        ctrSpeed.setInput(f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.S, f.KEYBOARD_CODE.ARROW_DOWN])
            + f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.W, f.KEYBOARD_CODE.ARROW_UP]));
        ctrStrafe.setInput(f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.A, f.KEYBOARD_CODE.ARROW_LEFT])
            + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.D, f.KEYBOARD_CODE.ARROW_RIGHT]));
        moveAvatar(ctrSpeed.getOutput(), ctrRotation.getOutput(), ctrStrafe.getOutput());
        ctrRotation.setInput(0);
        if (customerTimer.get() >= game.spawnTime && customers.nChildren < 9) {
            generateCustomer();
            customerTimer.set(0);
        }
        if (endlessMode) {
            if (game.failOrders > 0)
                endGame();
        }
        else {
            if (clockTimer.get() / 1000 >= 60) {
                clock++;
                clockTimer.set(0);
                updateClock();
            }
        }
        for (let i = 0; i < 4; i++) {
            let currentMachine = game.machines.getChild(i);
            currentMachine.update();
        }
        for (let customer of customers.getChildren()) {
            if (customer != undefined && customer.getParent() != null)
                customer.update();
        }
        if (activeBooster)
            updateBooster();
        viewport.draw();
    }
    function startGame() {
        document.getElementById("menu").setAttribute("style", "visibility: hidden");
        document.getElementById("optionsDiv").setAttribute("style", "visibility: hidden");
        document.getElementById("controlsDiv").setAttribute("style", "visibility: hidden");
        gameState = GAMESTATE.PLAY;
        menuMusic.play(false);
        backgroundMusic.play(true);
        clockTimer = new f.Time;
        customerTimer = new f.Time;
    }
    function hndMouse(_event) {
        ctrRotation.setInput(_event.movementX);
    }
    function moveAvatar(_speed, _rotation, _strafe) {
        game.avatar.mtxLocal.rotateY(_rotation);
        let posOld = game.avatar.mtxLocal.translation;
        game.avatar.mtxLocal.translateZ(_speed);
        game.avatar.mtxLocal.translateX(_strafe);
        // WALL BOUNCE
        let bouncedOff1 = bounceOffWalls(walls.getChildren());
        if (bouncedOff1.length < 2)
            return;
        bouncedOff1 = bounceOffWalls(bouncedOff1);
        if (bouncedOff1.length == 0)
            return;
        //
        console.log("Stuck!");
        game.avatar.mtxLocal.translation = posOld;
    }
    function createWalls() {
        let walls = new f.Node("Walls");
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
        let txtWall = new f.TextureImage("../Assets/Wall.png");
=======
        let txtWall = new f.TextureImage("/game/Assets/Wall.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
        let mtrWall = new f.Material("Wall", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtWall));
        for (let i = -game.numWalls / 2 + 0.5; i < game.numWalls / 2; i++) {
            walls.appendChild(new game.Wall(f.Vector2.ONE(game.sizeWall), f.Vector3.SCALE(new f.Vector3(-game.numWalls / 2, 0.5, i), game.sizeWall), f.Vector3.Y(90), mtrWall)); // left
            walls.appendChild(new game.Wall(f.Vector2.ONE(game.sizeWall), f.Vector3.SCALE(new f.Vector3(game.numWalls / 2, 0.5, i), game.sizeWall), f.Vector3.Y(-90), mtrWall)); // right
            //walls.appendChild(new Wall(f.Vector2.ONE(sizeWall), f.Vector3.SCALE(new f.Vector3(i, 0.5, -numWalls / 2), sizeWall), f.Vector3.Y(0), mtrWall)); // front
            walls.appendChild(new game.Wall(f.Vector2.ONE(game.sizeWall), f.Vector3.SCALE(new f.Vector3(i, 0.5, game.numWalls / 2), game.sizeWall), f.Vector3.Y(180), mtrWall)); // back
            walls.appendChild(new game.Wall(f.Vector2.ONE(game.sizeWall), f.Vector3.SCALE(new f.Vector3(i, 0.5, -game.numWalls / 2 + 1.5), game.sizeWall), f.Vector3.Y(0))); // invisible front (counters)
            walls.appendChild(new game.Wall(f.Vector2.ONE(game.sizeWall), f.Vector3.SCALE(new f.Vector3(i, 0.5, game.numWalls / 2 - 1), game.sizeWall), f.Vector3.Y(180))); // invisible back (machines)
        }
        // front:
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
        let txtDoor = new f.TextureImage("../Assets/Door.png");
        let mtrDoor = new f.Material("Door", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtDoor));
        walls.appendChild(new game.Wall(f.Vector2.ONE(game.sizeWall), f.Vector3.SCALE(new f.Vector3(-game.numWalls / 2 + 0.5, 0.5, -game.numWalls / 2), game.sizeWall), f.Vector3.Y(0), mtrDoor)); // door
        walls.appendChild(new game.Wall(f.Vector2.ONE(game.sizeWall), f.Vector3.SCALE(new f.Vector3(-game.numWalls / 2 + 1.5, 0.5, -game.numWalls / 2), game.sizeWall), f.Vector3.Y(0), mtrWall)); // wall
        let txtWindowL = new f.TextureImage("../Assets/Window_L.png");
        let mtrWindowL = new f.Material("WindowL", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtWindowL));
        let txtWindowR = new f.TextureImage("../Assets/Window_R.png");
=======
        let txtDoor = new f.TextureImage("/game/Assets/Door.png");
        let mtrDoor = new f.Material("Door", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtDoor));
        walls.appendChild(new game.Wall(f.Vector2.ONE(game.sizeWall), f.Vector3.SCALE(new f.Vector3(-game.numWalls / 2 + 0.5, 0.5, -game.numWalls / 2), game.sizeWall), f.Vector3.Y(0), mtrDoor)); // door
        walls.appendChild(new game.Wall(f.Vector2.ONE(game.sizeWall), f.Vector3.SCALE(new f.Vector3(-game.numWalls / 2 + 1.5, 0.5, -game.numWalls / 2), game.sizeWall), f.Vector3.Y(0), mtrWall)); // wall
        let txtWindowL = new f.TextureImage("/game/Assets/Window_L.png");
        let mtrWindowL = new f.Material("WindowL", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtWindowL));
        let txtWindowR = new f.TextureImage("/game/Assets/Window_R.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
        let mtrWindowR = new f.Material("WindowR", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtWindowR));
        walls.appendChild(new game.Wall(f.Vector2.ONE(game.sizeWall), f.Vector3.SCALE(new f.Vector3(-game.numWalls / 2 + 2.5, 0.5, -game.numWalls / 2), game.sizeWall), f.Vector3.Y(0), mtrWindowL)); // windowL
        walls.appendChild(new game.Wall(f.Vector2.ONE(game.sizeWall), f.Vector3.SCALE(new f.Vector3(-game.numWalls / 2 + 3.5, 0.5, -game.numWalls / 2), game.sizeWall), f.Vector3.Y(0), mtrWindowR)); // windowR
        walls.appendChild(new game.Wall(f.Vector2.ONE(game.sizeWall), f.Vector3.SCALE(new f.Vector3(-game.numWalls / 2 + 4.5, 0.5, -game.numWalls / 2), game.sizeWall), f.Vector3.Y(0), mtrWall)); // wall
        walls.appendChild(new game.Wall(f.Vector2.ONE(game.sizeWall), f.Vector3.SCALE(new f.Vector3(-game.numWalls / 2 + 5.5, 0.5, -game.numWalls / 2), game.sizeWall), f.Vector3.Y(0), mtrWindowL)); // windowL
        walls.appendChild(new game.Wall(f.Vector2.ONE(game.sizeWall), f.Vector3.SCALE(new f.Vector3(-game.numWalls / 2 + 6.5, 0.5, -game.numWalls / 2), game.sizeWall), f.Vector3.Y(0), mtrWindowR)); // windowR
        walls.appendChild(new game.Wall(f.Vector2.ONE(game.sizeWall), f.Vector3.SCALE(new f.Vector3(-game.numWalls / 2 + 7.5, 0.5, -game.numWalls / 2), game.sizeWall), f.Vector3.Y(0), mtrWall)); // wall
        return walls;
    }
    function createCounter() {
        let counter = new f.Node("Counter");
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
        let txtCounterSide = new f.TextureImage("../Assets/CounterSide.png");
        let mtrCounterSide = new f.Material("CounterSide", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtCounterSide));
        let txtCounterTop = new f.TextureImage("../Assets/CounterTop.png");
=======
        let txtCounterSide = new f.TextureImage("/game/Assets/CounterSide.png");
        let mtrCounterSide = new f.Material("CounterSide", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtCounterSide));
        let txtCounterTop = new f.TextureImage("/game/Assets/CounterTop.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
        let mtrCounterTop = new f.Material("CounterTop", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtCounterTop));
        for (let i = -game.numWalls * game.sizeWall / 3 - 0.5; i < game.numWalls * game.sizeWall / 3 + 1; i++) {
            counter.appendChild(new game.Counter(new f.Vector2(1, 1), new f.Vector3(i, 0.5, -8), new f.Vector3(0, 0, 0), mtrCounterSide)); // front
            counter.appendChild(new game.Counter(new f.Vector2(1, 1), new f.Vector3(i, 1, -8.5), new f.Vector3(90, 0, 0), mtrCounterTop)); // top
        }
        counter.appendChild(new game.Counter(new f.Vector2(1, 1), new f.Vector3(game.sizeWall * (game.numWalls - 2) * -0.5, 0.5, -8.5), f.Vector3.Y(-90), mtrCounterSide)); // left
        counter.appendChild(new game.Counter(new f.Vector2(1, 1), new f.Vector3(game.sizeWall * (game.numWalls - 2) * 0.5, 0.5, -8.5), f.Vector3.Y(90), mtrCounterSide)); // right
        return counter;
    }
    function createMachines() {
        let machines = new f.Node("Machines");
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
        let txtMachine = new f.TextureImage("../Assets/Machine.png");
        let mtrMachine = new f.Material("Appearance", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtMachine));
        let txtMachineSide = new f.TextureImage("../Assets/Machine_Side.png");
=======
        let txtMachine = new f.TextureImage("/game/Assets/Machine.png");
        let mtrMachine = new f.Material("Appearance", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtMachine));
        let txtMachineSide = new f.TextureImage("/game/Assets/Machine_Side.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
        let mtrMachineSide = new f.Material("Appearance", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtMachineSide));
        for (let i = 0; i < 4; i++) {
            machines.appendChild(new game.Machine("Machine_" + (i + 1), new f.Vector2(2, 2), new f.Vector3(-9 + i * 6, 1, 10), f.Vector3.Y(180), mtrMachine)); // front
            machines.getChild(i).appendChild(new game.Machine("Machine_L" + (i + 1), new f.Vector2(2, 2), new f.Vector3(-1, 0, -1), f.Vector3.Y(-90), mtrMachineSide)); // left
            machines.getChild(i).appendChild(new game.Machine("Machine_R" + (i + 1), new f.Vector2(2, 2), new f.Vector3(1, 0, -1), f.Vector3.Y(90), mtrMachineSide)); // right
            // conveyor belt
            if (i < 3) {
                let conveyorBeltTop = new game.GameObject("ConveyorBelt", new f.Vector2(4, 1), new f.Vector3(-6 + i * 6, 1, 11), new f.Vector3(-90, 180, 0));
                let conveyorBeltFront = new game.GameObject("ConveyorBelt", new f.Vector2(4, 0.5), new f.Vector3(-6 + i * 6, 0.75, 10.5), f.Vector3.Y(180));
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
                let txtTop = new f.TextureImage("../Assets/ConveyorBelt_Top.png");
                let txtFront = new f.TextureImage("../Assets/ConveyorBelt_Front.png");
=======
                let txtTop = new f.TextureImage("/game/Assets/ConveyorBelt_Top.png");
                let txtFront = new f.TextureImage("/game/Assets/ConveyorBelt_Front.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
                let mtrTop = new f.Material("Appearance", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtTop));
                let mtrFront = new f.Material("Appearance", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtFront));
                let cmpMtrTop = new f.ComponentMaterial(mtrTop);
                let cmpMtrFront = new f.ComponentMaterial(mtrFront);
                conveyorBeltTop.addComponent(cmpMtrTop);
                conveyorBeltFront.addComponent(cmpMtrFront);
                conveyorBelts.appendChild(conveyorBeltTop);
                conveyorBelts.appendChild(conveyorBeltFront);
            }
        }
        root.appendChild(conveyorBelts);
        return machines;
    }
    function bounceOffWalls(_walls) {
        let bouncedOff = [];
        let posAvatar = game.avatar.mtxLocal.translation;
        for (let wall of _walls) {
            let posBounce = wall.calculateBounce(posAvatar, 1);
            if (posBounce) {
                game.avatar.mtxLocal.translation = posBounce;
                bouncedOff.push(wall);
            }
        }
        return bouncedOff;
    }
    // #region (INTERACT FUNCTIONS)
    function interact() {
        lookAtInstructions();
        interactCustomer();
        interactMachine();
        pickUpTeddy();
        throwAwayTeddy();
    }
    function hndlInteract(object) {
        // CHECKING IF OBJECT BEHIND AVATAR:
        let localObject = f.Vector3.TRANSFORMATION(object.mtxWorld.translation, game.avatar.mtxWorldInverse, true);
        if (localObject.z < 0) {
            return null;
        }
        // DISTANCE OBJECT-INTERSECTION:
        let ray = new f.Ray(game.avatar.mtxWorld.getZ(), game.avatar.mtxWorld.translation, 20);
        let intersect = ray.intersectPlane(object.mtxWorld.translation, object.mtxWorld.getZ());
        let vctDistance = f.Vector3.DIFFERENCE(object.mtxWorld.translation, intersect);
        let distanceOI = Math.sqrt(Math.pow(vctDistance.x, 2) + Math.pow(vctDistance.y, 2) + Math.pow(vctDistance.z, 2));
        // DISTANCE OBJECT-AVATAR:
        let vctAvatar = f.Vector3.DIFFERENCE(game.avatar.mtxWorld.translation, object.mtxWorld.translation);
        let distanceOA = f.Vector3.DOT(vctAvatar, object.mtxWorld.getZ());
        let distances = [distanceOI, distanceOA];
        return distances;
    }
    function lookAtInstructions() {
        if (hndlInteract(instructions) != null) {
            let distances = hndlInteract(instructions);
            let distanceOI = distances[0];
            let distanceOA = distances[1];
            if (distanceOI < 2 && distanceOA < 3) {
                document.getElementById("instructions").setAttribute("style", "visibility: visible");
                gameState = GAMESTATE.PAUSE;
            }
        }
    }
    function interactCustomer() {
        for (let customer of customers.getChildren()) {
            if (hndlInteract(customer) != null) {
                let distances = hndlInteract(customer);
                let distanceOI = distances[0];
                let distanceOA = distances[1];
                if (distanceOI < 1.1 && distanceOA < 5 && customer.cmpStateMachine.stateCurrent == game.ACTION.WAITING_HAPPY || customer.cmpStateMachine.stateCurrent == game.ACTION.WAITING_ANGRY) {
                    if (game.avatar.getChild(1) == undefined) { // take order
                        customer.showOrder();
                    }
                    else {
                        if (customer.checkOrder(game.avatar.getChild(1))) { // give teddy bear
                            game.avatar.removeChild(game.avatar.getChild(1));
                            game.money += 80;
                            moneySound.play(true);
                            game.succOrders++;
                            customer.cmpStateMachine.stateCurrent = game.ACTION.LEAVING;
                        }
                        else { // if teddy is wrong
                            customer.cmpAudDeny.play(true);
                        }
                    }
                }
            }
        }
    }
    function interactMachine() {
        for (let machine of game.machines.getChildren()) {
            if (hndlInteract(machine) != null) {
                let distances = hndlInteract(machine);
                let distanceOI = distances[0];
                let distanceOA = distances[1];
                // display machine-screen
                if (distanceOI < 1.1 && distanceOA < 5 && machine.cmpStateMachine.stateCurrent == game.STATE.WAITING) {
                    gameState = GAMESTATE.MACHINE;
                    document.getElementById("machineInput").setAttribute("style", "visibility: visible");
                    document.getElementById("fur").setAttribute("style", "visibility: hidden");
                    document.getElementById("eyecolor").setAttribute("style", "visibility: hiddden");
                    document.getElementById("accessory").setAttribute("style", "visibility: hidden");
                    document.getElementById("sound").setAttribute("style", "visibility: hidden");
                    switch (machine) {
                        case game.machines.getChild(0):
                            document.getElementById("fur").setAttribute("style", "visibility: visible");
                            document.getElementById("teddyBear").innerHTML = "";
                            selectedMachine = machine;
                            break;
                        case game.machines.getChild(1):
                            document.getElementById("eyecolor").setAttribute("style", "visibility: visible");
                            document.getElementById("teddyBear").innerHTML = machine.getChild(2).fur.name;
                            selectedMachine = machine;
                            break;
                        case game.machines.getChild(2):
                            document.getElementById("accessory").setAttribute("style", "visibility: visible");
                            document.getElementById("teddyBear").innerHTML = machine.getChild(2).fur.name + ", " + machine.getChild(2).eyecolor.name;
                            selectedMachine = machine;
                            break;
                        case game.machines.getChild(3):
                            document.getElementById("sound").setAttribute("style", "visibility: visible");
                            document.getElementById("teddyBear").innerHTML = machine.getChild(2).fur.name + ", " + machine.getChild(2).eyecolor.name + ", " + machine.getChild(2).accessory.name;
                            selectedMachine = machine;
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }
    function pickUpTeddy() {
        if (game.avatar.getChild(1) == undefined) {
            for (let teddy of game.machines.getChild(3).getChildren()) {
                if (hndlInteract(teddy) != null) {
                    let distances = hndlInteract(teddy);
                    let distanceOI = distances[0];
                    let distanceOA = distances[1];
                    if (distanceOI < 2 && distanceOA < 5 && game.machines.getChild(3).cmpStateMachine.stateCurrent == game.STATE.FINISHED) {
                        if (teddy.progress == 4) {
                            game.avatar.appendChild(teddy);
                            teddy.mtxLocal.translate(new f.Vector3(0, 1.25, -2.5));
                            teddy.sound.getComponent(f.ComponentAudio).play(true);
                        }
                    }
                }
            }
        }
    }
    function throwAwayTeddy() {
        if (hndlInteract(trashcan) != null) {
            let distances = hndlInteract(trashcan);
            let distanceOI = distances[0];
            let distanceOA = distances[1];
            if (distanceOI < 1.1 && distanceOA < 5) {
                game.avatar.removeChild(game.avatar.getChild(1));
            }
        }
    }
    // #endregion (INTERACT FUNCTIONS)
    function exitMachine() {
        document.getElementById("machineInput").setAttribute("style", "visibility: hidden");
        document.getElementById("fur").setAttribute("style", "visibility: hidden");
        document.getElementById("eyecolor").setAttribute("style", "visibility: hiddden");
        document.getElementById("accessory").setAttribute("style", "visibility: hidden");
        document.getElementById("sound").setAttribute("style", "visibility: hidden");
        selectedMachine = null;
        gameState = GAMESTATE.PLAY;
    }
    function addAttribute(_option) {
        let teddyInside = selectedMachine.getChild(2);
        if (selectedMachine.index == 0) {
            if (selectedMachine.getChild(2) == undefined) {
                selectedMachine.appendChild(new game.TeddyBear(new f.Vector2(0.5, 0.5), new f.Vector3(0, 0, 0), f.Vector3.Y(180), _option));
                selectedMachine.getChild(2).mtxLocal.translateZ(1);
                selectedMachine.cmpStateMachine.stateCurrent = game.STATE.WORKING;
            }
        }
        else if (teddyInside.progress == 1 && selectedMachine.index == 1) {
            teddyInside.addEyecolor(_option);
            selectedMachine.cmpStateMachine.stateCurrent = game.STATE.WORKING;
        }
        else if (teddyInside.progress == 2 && selectedMachine.index == 2) {
            teddyInside.addAccessory(_option);
            selectedMachine.cmpStateMachine.stateCurrent = game.STATE.WORKING;
        }
        else if (teddyInside.progress == 3 && selectedMachine.index == 3) {
            teddyInside.addSound(_option);
            selectedMachine.cmpStateMachine.stateCurrent = game.STATE.WORKING;
        }
    }
    function generateCustomer() {
        let randomAppearance = Math.floor(Math.random() * 6 + 1); // generates number from 1 - 6
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
        let txtCustomer = new f.TextureImage("../Assets/Customer_" + randomAppearance + ".png");
=======
        let txtCustomer = new f.TextureImage("/game/Assets/Customer_" + randomAppearance + ".png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
        let mtrCustomer = new f.Material("Appearance", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtCustomer));
        let customer = new game.Customer(new f.Vector2(1, 2), new f.Vector3(-10.5, 1, -10), new f.Vector3(0, 0, 0), mtrCustomer);
        customer.posTarget = customerPositions[index];
        if (index == game.numWalls) {
            index = 0;
        }
        else {
            index++;
        }
        customers.appendChild(customer);
        newCustomerAud.play(true);
    }
    function createPositions() {
        let positions = [];
        let j = 0;
        for (let i = -game.numWalls * game.sizeWall / 3; i < game.numWalls * game.sizeWall / 3 + 1; i += 2) {
            positions[j] = new f.Vector3(i, 1, -10);
            j++;
        }
        return positions;
    }
    function updateClock() {
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
        document.getElementById("clockImg").src = "../Assets/Clock" + clock + ".png";
=======
        document.getElementById("clockImg").src = "/game/Assets/Clock" + clock + ".png";
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
        if (clock == 6)
            endGame();
    }
    function hndlBooster() {
        if (!activeBooster && game.collectedBooster) {
            game.boosterSound.play(true);
            for (let i = 0; i < 4; i++) { // apply boost to machines
                let currentMachine = game.machines.getChild(i);
                currentMachine.productionTime = game.machineTime * 0.3;
            }
            activeBooster = true;
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
            document.getElementById("boosterImg").src = "../Assets/Booster_Active.png";
=======
            document.getElementById("boosterImg").src = "/game/Assets/Booster_Active.png";
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
            boosterTimer.set(0);
        }
    }
    function updateBooster() {
        if (activeBooster && boosterTimer.get() / 1000 >= 30) {
            for (let i = 0; i < 4; i++) { //remove boost from machines
                let currentMachine = game.machines.getChild(i);
                currentMachine.productionTime = game.machineTime;
            }
            activeBooster = false;
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
            document.getElementById("boosterImg").src = "../Assets/Booster_Empty.png";
=======
            document.getElementById("boosterImg").src = "/game/Assets/Booster_Empty.png";
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
            game.collectedBooster = false;
        }
    }
    function endGame() {
        gameState = GAMESTATE.END;
        finishSound.play(true);
        backgroundMusic.play(false);
        document.getElementById("transparentDiv").setAttribute("style", "visibility: visible");
        document.getElementById("endscore").setAttribute("style", "visibility: visible");
        document.getElementById("money").innerHTML = game.money + "$";
        document.getElementById("succOrders").innerHTML = "" + game.succOrders;
        document.getElementById("failOrders").innerHTML = "" + game.failOrders;
        switch (game.difficulty) {
            case 0:
                document.getElementById("difficulty").innerHTML = "easy";
                break;
            case 1:
                document.getElementById("difficulty").innerHTML = "normal";
                break;
            case 2:
                document.getElementById("difficulty").innerHTML = "hard";
                break;
            default:
                break;
        }
        document.getElementById("score").innerHTML = "" + (game.money * 2 + game.succOrders - game.failOrders + game.difficulty * 10) * 100;
    }
    // #region (MENU FUNCTIONS)
    function showOptions() {
        document.getElementById("controlsDiv").setAttribute("style", "visibility: hidden");
        document.getElementById("optionsDiv").setAttribute("style", "visibility: visible");
    }
    function showControls() {
        document.getElementById("optionsDiv").setAttribute("style", "visibility: hidden");
        document.getElementById("controlsDiv").setAttribute("style", "visibility: visible");
    }
    function setDifficulty0() {
        document.getElementById("difficulty_0").setAttribute("style", "background-color: rgb(255, 157, 170)");
        document.getElementById("difficulty_1").setAttribute("style", "background-color: rgb(255, 249, 243)");
        document.getElementById("difficulty_2").setAttribute("style", "background-color: rgb(255, 249, 243)");
        setParameters(game.parametersArray[0].difficulty);
    }
    function setDifficulty1() {
        document.getElementById("difficulty_0").setAttribute("style", "background-color: rgb(255, 249, 243)");
        document.getElementById("difficulty_1").setAttribute("style", "background-color: rgb(255, 157, 170)");
        document.getElementById("difficulty_2").setAttribute("style", "background-color: rgb(255, 249, 243)");
        setParameters(game.parametersArray[1].difficulty);
    }
    function setDifficulty2() {
        document.getElementById("difficulty_0").setAttribute("style", "background-color: rgb(255, 249, 243)");
        document.getElementById("difficulty_1").setAttribute("style", "background-color: rgb(255, 249, 243)");
        document.getElementById("difficulty_2").setAttribute("style", "background-color: rgb(255, 157, 170)");
        setParameters(game.parametersArray[2].difficulty);
    }
    function setParameters(difficulty) {
        difficulty = game.parametersArray[difficulty].difficulty;
        game.machineTime = game.parametersArray[difficulty].machineTime;
        game.customerTime = game.parametersArray[difficulty].customerTime;
        game.spawnTime = game.parametersArray[difficulty].spawnTime;
    }
    function setMode0() {
        document.getElementById("mode_0").setAttribute("style", "background-color: rgb(255, 157, 170)");
        document.getElementById("mode_1").setAttribute("style", "background-color: rgb(255, 249, 243)");
        endlessMode = false;
        document.getElementById("clock").setAttribute("style", "visibility: visible");
    }
    function setMode1() {
        document.getElementById("mode_0").setAttribute("style", "background-color: rgb(255, 249, 243)");
        document.getElementById("mode_1").setAttribute("style", "background-color: rgb(255, 157, 170)");
        endlessMode = true;
        document.getElementById("clock").setAttribute("style", "visibility: hidden");
    }
    // #endregion (MENU FUNCTIONS)
})(game || (game = {}));
var game;
(function (game) {
    var f = FudgeCore;
    var faid = FudgeAid;
    let ComponentStateMachineCustomer = /** @class */ (() => {
        class ComponentStateMachineCustomer extends faid.ComponentStateMachine {
            constructor() {
                super();
                this.instructions = ComponentStateMachineCustomer.instructions;
            }
            static setupStateMachine() {
                let setup = new faid.StateMachineInstructions();
                setup.setAction(game.ACTION.ENTERING, (_machine) => {
                    let container = _machine.getContainer();
                    if (container.mtxLocal.translation.equals(container.posTarget, 0.5))
                        _machine.transit(game.ACTION.WAITING_HAPPY);
                    container.enter();
                });
                setup.setTransition(game.ACTION.ENTERING, game.ACTION.WAITING_HAPPY, (_machine) => {
                    let container = _machine.getContainer();
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
                    let txtMood = new f.TextureImage("../Assets/Customer_Mood_Happy.png");
=======
                    let txtMood = new f.TextureImage("/game/Assets/Customer_Mood_Happy.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
                    let mtrMood = new f.Material("Mood", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtMood));
                    let cmpMtrMood = new f.ComponentMaterial(mtrMood);
                    container.mood.addComponent(cmpMtrMood);
                });
                setup.setAction(game.ACTION.WAITING_HAPPY, (_machine) => {
                    let container = _machine.getContainer();
                    f.Time.game.setTimer(container.patience * 0.9, 1, (_event) => {
                        _machine.transit(game.ACTION.WAITING_ANGRY);
                    });
                });
                setup.setTransition(game.ACTION.WAITING_HAPPY, game.ACTION.WAITING_ANGRY, (_machine) => {
                    let container = _machine.getContainer();
                    container.mood.removeComponent(container.mood.getComponent(f.ComponentMaterial));
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
                    let txtMood = new f.TextureImage("../Assets/Customer_Mood_Angry.png");
=======
                    let txtMood = new f.TextureImage("/game/Assets/Customer_Mood_Angry.png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
                    let mtrMood = new f.Material("Mood", f.ShaderTexture, new f.CoatTextured(game.clrWhite, txtMood));
                    let cmpMtrMood = new f.ComponentMaterial(mtrMood);
                    container.mood.addComponent(cmpMtrMood);
                    container.cmpAudAngry.play(true);
                });
                setup.setAction(game.ACTION.WAITING_ANGRY, (_machine) => {
                    let container = _machine.getContainer();
                    f.Time.game.setTimer(container.patience * 0.1, 1, (_event) => {
                        _machine.transit(game.ACTION.LEAVING);
                    });
                });
                setup.setTransition(game.ACTION.WAITING_ANGRY, game.ACTION.LEAVING, (_machine) => {
                    let container = _machine.getContainer();
                    if (container.failed == false && container.successful == false) {
                        container.cmpAudGrunt.play(true);
                        container.mood.removeComponent(container.mood.getComponent(f.ComponentMaterial)); // deletes mood
                        game.failOrders++;
                        container.failed = true;
                        container.updateScore();
                    }
                });
                setup.setAction(game.ACTION.LEAVING, (_machine) => {
                    let container = _machine.getContainer();
                    f.Time.game.setTimer(800, 1, (_event) => {
                        if (container.mtxLocal.translation.equals(new f.Vector3(-10.5, 1, -10), 0.5))
                            container.delete();
                        container.leave();
                    });
                });
                return setup;
            }
        }
        ComponentStateMachineCustomer.instructions = ComponentStateMachineCustomer.setupStateMachine();
        return ComponentStateMachineCustomer;
    })();
    game.ComponentStateMachineCustomer = ComponentStateMachineCustomer;
})(game || (game = {}));
var game;
(function (game) {
    var f = FudgeCore;
    var faid = FudgeAid;
    let ComponentStateMachineMachine = /** @class */ (() => {
        class ComponentStateMachineMachine extends faid.ComponentStateMachine {
            constructor() {
                super();
                this.instructions = ComponentStateMachineMachine.instructions;
            }
            static setupStateMachine() {
                let setup = new faid.StateMachineInstructions();
                setup.setAction(game.STATE.FREE, (_machine) => {
                    // waiting for teddy
                });
                setup.setAction(game.STATE.WAITING, (_machine) => {
                    // waiting for user input
                });
                setup.setAction(game.STATE.WORKING, (_machine) => {
                    let container = _machine.getContainer();
                    if (!container.cmpAudWorking.isPlaying)
                        container.cmpAudWorking.play(true);
                    f.Time.game.setTimer(container.productionTime, 1, (_event) => {
                        _machine.transit(game.STATE.FINISHED);
                    });
                });
                setup.setTransition(game.STATE.WORKING, game.STATE.FINISHED, (_machine) => {
                    let container = _machine.getContainer();
                    container.cmpAudWorking.play(false);
                    container.cmpAudFinished.play(true);
                });
                setup.setAction(game.STATE.FINISHED, (_machine) => {
                    let container = _machine.getContainer();
                    if (container.name != "Machine_4") {
                        let nextMachine = container.getParent().getChild((container.index + 1));
                        if (nextMachine.cmpStateMachine.stateCurrent == game.STATE.FREE) {
                            nextMachine.appendChild(container.getChild(2));
                            nextMachine.cmpStateMachine.stateCurrent = game.STATE.WAITING;
                            if (container.name == "Machine_1") {
                                container.resetTo(game.STATE.WAITING);
                                //_machine.transit(STATE.WAITING); // doesn't work?! -> machines get stuck in state 3 because of that
                            }
                            else {
                                container.resetTo(game.STATE.FREE);
                                //_machine.transit(STATE.FREE); // doesn't work?! -> machines get stuck in state 3 because of that
                            }
                        }
                    }
                    else {
                        if (container.getChild(2) == undefined)
                            container.resetTo(game.STATE.FREE);
                        //_machine.transit(STATE.FREE); // doesn't work?! -> machines get stuck in state 3 because of that
                    }
                });
                return setup;
            }
        }
        ComponentStateMachineMachine.instructions = ComponentStateMachineMachine.setupStateMachine();
        return ComponentStateMachineMachine;
    })();
    game.ComponentStateMachineMachine = ComponentStateMachineMachine;
})(game || (game = {}));
var game;
(function (game) {
    var f = FudgeCore;
    const clrWhite = f.Color.CSS("white");
    class TeddyBear extends game.GameObject {
        constructor(_size, _position, _rotation, _option) {
            super("TeddyBear", _size, _position, _rotation);
            this.fur = new f.Node("Fur_" + _option);
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
            let txtTeddyBear = new f.TextureImage("../Assets/Fur_" + _option + ".png");
=======
            let txtTeddyBear = new f.TextureImage("/game/Assets/Fur_" + _option + ".png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
            let mtrTeddyBear = new f.Material("Fur", f.ShaderTexture, new f.CoatTextured(clrWhite, txtTeddyBear));
            let cmpMaterial = new f.ComponentMaterial(mtrTeddyBear);
            cmpMaterial.pivot.scale(f.Vector2.ONE(1));
            this.addComponent(cmpMaterial);
            this.progress = 1;
        }
        addEyecolor(_option) {
            this.eyecolor = new game.GameObject("Eyecolor_" + _option, new f.Vector2(0.118, 0.026), new f.Vector3(0.007, 0.1, 0.001), f.Vector3.ZERO());
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
            let txtEyecolor = new f.TextureImage("../Assets/Eyecolor_" + _option + ".png");
=======
            let txtEyecolor = new f.TextureImage("/game/Assets/Eyecolor_" + _option + ".png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
            let mtrEyecolor = new f.Material("Eyecolor", f.ShaderTexture, new f.CoatTextured(clrWhite, txtEyecolor));
            let cmpMtrEyecolor = new f.ComponentMaterial(mtrEyecolor);
            this.eyecolor.addComponent(cmpMtrEyecolor);
            this.appendChild(this.eyecolor);
            this.progress++;
        }
        addAccessory(_option) {
            this.accessory = new game.GameObject("Accessory_" + _option, new f.Vector2(0.1842, 0.125), new f.Vector3(0, -0.042, 0.001), f.Vector3.ZERO());
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
            let txtAccessory = new f.TextureImage("../Assets/Accessory_" + _option + ".png");
=======
            let txtAccessory = new f.TextureImage("/game/Assets/Accessory_" + _option + ".png");
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
            let mtrAccessory = new f.Material("Accessory", f.ShaderTexture, new f.CoatTextured(clrWhite, txtAccessory));
            let cmpMtrAccessory = new f.ComponentMaterial(mtrAccessory);
            this.accessory.addComponent(cmpMtrAccessory);
            this.appendChild(this.accessory);
            this.progress++;
        }
        addSound(_option) {
            this.sound = new f.Node("Sound_" + _option);
<<<<<<< HEAD:game/Build/MissysTeddyAssembly.js
            let cmpAudio = new f.ComponentAudio(new f.Audio("../Assets/Sound_" + _option + ".wav"), false, true);
=======
            let cmpAudio = new f.ComponentAudio(new f.Audio("/game/Assets/Sound_" + _option + ".wav"), false, true);
>>>>>>> dbbcfb80a712bc7eb0f32c204f042586f77680b4:game/Main.js
            this.sound.addComponent(cmpAudio);
            this.appendChild(this.sound);
            this.progress++;
        }
    }
    game.TeddyBear = TeddyBear;
})(game || (game = {}));
var game;
(function (game) {
    var f = FudgeCore;
    class Wall extends game.GameObject {
        constructor(_size, _position, _rotation, _material) {
            super("Wall", _size, _position, _rotation);
            if (_material != null) {
                let cmpMaterial = new f.ComponentMaterial(_material);
                cmpMaterial.pivot.scale(f.Vector2.ONE(1));
                this.addComponent(cmpMaterial);
            }
        }
    }
    game.Wall = Wall;
})(game || (game = {}));
//# sourceMappingURL=MissysTeddyAssembly.js.map