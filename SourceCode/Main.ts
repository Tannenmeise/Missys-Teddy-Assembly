namespace game {
    import f = FudgeCore;
    import faid = FudgeAid;

    enum GAMESTATE {
        MENU, PLAY, MACHINE, PAUSE, END
    }

    async function communicate(_url: RequestInfo): Promise<void> {

        let response1: Response = await fetch(_url);
        let response2: JSON = await response1.json();
        parametersArray = JSON.parse(JSON.stringify(response2));
    }

    window.addEventListener("load", hndLoad);

    let gameState: GAMESTATE = GAMESTATE.MENU;
    let selectedMachine: Machine;
    export const clrWhite: f.Color = f.Color.CSS("white");
    export const sizeWall: number = 3;
    export const numWalls: number = 8;
    export let machineTime: number = 20000;
    export let customerTime: number = (machineTime + 4000) * 4 * 4;
    export let spawnTime: number = (machineTime + 4000) * 4;
    export let difficulty: number = 0; // 0: easy, 1: normal, 2: hard
    export let succOrders: number = 0;
    export let failOrders: number = 0;
    export let money: number = 0;
    export let avatar: f.Node = new f.Node("Avatar");
    export let machines: f.Node = new f.Node("Machines");

    // #region (AUDIO)
    let head: f.Node = new f.Node("Head");
    avatar.appendChild(head);
    head.addComponent(new f.ComponentTransform());
    head.mtxLocal.translateY(1.7);
    let ears: f.ComponentAudioListener = new f.ComponentAudioListener();
    head.addComponent(ears);
    // #endregion (AUDIO)

    let ctrSpeed: f.Control = new f.Control("AvatarSpeed", 0.3, f.CONTROL_TYPE.PROPORTIONAL);
    ctrSpeed.setDelay(100);
    let ctrStrafe: f.Control = new f.Control("AvatarSpeed", 0.1, f.CONTROL_TYPE.PROPORTIONAL);
    ctrSpeed.setDelay(100);
    let ctrRotation: f.Control = new f.Control("AvatarRotation", -0.1, f.CONTROL_TYPE.PROPORTIONAL);
    ctrRotation.setDelay(100);

    let viewport: f.Viewport;

    let root: f.Node = new f.Node("Root");
    let building: f.Node = new f.Node("Building");
    root.appendChild(building);
    let walls: f.Node = new f.Node("Walls");
    let counter: f.Node = new f.Node("Counter");
    let customers: f.Node = new f.Node("Customers");
    root.appendChild(customers);
    let trashcan: GameObject;
    let conveyorBelts: f.Node = new f.Node("ConveyorBelts");
    let instructions: GameObject;

    let clockTimer: f.Time; // for clock
    let clock: number = 0;
    let endlessMode: boolean = false; // false: shift, true: endless
    let customerTimer: f.Time; // when the next customer will come
    let index: number = 0;
    let customerPositions: f.Vector3[];
    // #region (BOOSTER)
    let activeBooster: boolean = false;
    export let collectedBooster: boolean = false;
    let boosterTimer: f.Time = new f.Time;
    export let boosterSound: f.ComponentAudio = new f.ComponentAudio(new f.Audio("../Assets/Booster.wav"), false, false);
    root.addComponent(boosterSound);
    // #endregion (BOOSTER)
    let backgroundMusic: f.ComponentAudio = new f.ComponentAudio(new f.Audio("../Assets/BackgroundMusic.wav"), true);
    root.addComponent(backgroundMusic);
    let menuMusic: f.ComponentAudio = new f.ComponentAudio(new f.Audio("../Assets/MenuMusic.wav"), true, true);
    root.addComponent(menuMusic);
    let newCustomerAud: f.ComponentAudio = new f.ComponentAudio(new f.Audio("../Assets/NewCustomer.wav"));
    root.addComponent(newCustomerAud);
    let moneySound: f.ComponentAudio = new f.ComponentAudio(new f.Audio("../Assets/Money.wav"), false, false);
    root.addComponent(moneySound);
    let finishSound: f.ComponentAudio = new f.ComponentAudio(new f.Audio("../Assets/Finish.wav"), false, false);
    root.addComponent(finishSound);


    async function hndLoad(_event: Event): Promise<void> {
        await communicate("../Difficulties.json");

        const canvas: HTMLCanvasElement = document.querySelector("canvas");

        let meshQuad: f.MeshQuad = new f.MeshQuad("Quad");

        // #region (ROOM)
        let txtFloor: f.TextureImage = new f.TextureImage("../Assets/Floor.png");
        let mtrFloor: f.Material = new f.Material("Floor", f.ShaderTexture, new f.CoatTextured(clrWhite, txtFloor));
        let floor: faid.Node = new faid.Node("Floor", f.Matrix4x4.ROTATION_X(-90), mtrFloor, meshQuad);
        floor.mtxLocal.scale(f.Vector3.ONE(sizeWall * numWalls));
        floor.getComponent(f.ComponentMaterial).pivot.scale(f.Vector2.ONE(numWalls));
        building.appendChild(floor);

        let txtCeiling: f.TextureImage = new f.TextureImage("../Assets/Ceiling.png");
        let mtrCeiling: f.Material = new f.Material("Floor", f.ShaderTexture, new f.CoatTextured(clrWhite, txtCeiling));
        let ceiling: faid.Node = new faid.Node("Floor", f.Matrix4x4.TRANSLATION(new f.Vector3(0, sizeWall, 0)), mtrCeiling, meshQuad);
        ceiling.mtxLocal.rotateX(90);
        ceiling.mtxLocal.scale(f.Vector3.ONE(sizeWall * numWalls));
        ceiling.getComponent(f.ComponentMaterial).pivot.scale(f.Vector2.ONE(numWalls));
        building.appendChild(ceiling);

        walls = createWalls();
        building.appendChild(walls);
        // #endregion (ROOM)

        counter = createCounter();
        root.appendChild(counter);

        customerPositions = createPositions();

        machines = createMachines();
        root.appendChild(machines);

        // #region (CASH REGISTER)
        let txtCashRegisterBF: f.TextureImage = new f.TextureImage("../Assets/CashRegister_BaseFront.png");
        let mtrCashRegisterBF: f.Material = new f.Material("CashRegister", f.ShaderTexture, new f.CoatTextured(clrWhite, txtCashRegisterBF));
        let cmpMtrCashRegister: f.ComponentMaterial = new f.ComponentMaterial(mtrCashRegisterBF);
        let cashRegister: GameObject = new GameObject("CashRegister", new f.Vector2(0.555, 0.138), new f.Vector3(-sizeWall * numWalls / 2 + 4, 1.069, -8.125), f.Vector3.ONE(0));
        cashRegister.addComponent(cmpMtrCashRegister);

        let txtCashRegisterBS: f.TextureImage = new f.TextureImage("../Assets/CashRegister_BaseSide.png");
        let mtrCashRegisterBS: f.Material = new f.Material("CashRegister", f.ShaderTexture, new f.CoatTextured(clrWhite, txtCashRegisterBS));

        let cashRegisterBL: GameObject = new GameObject("CashRegister", new f.Vector2(0.555, 0.238), new f.Vector3(-0.277, 0.05, -0.277), f.Vector3.Y(90));
        let cmpMtrCashRegisterBL: f.ComponentMaterial = new f.ComponentMaterial(mtrCashRegisterBS);
        cashRegisterBL.addComponent(cmpMtrCashRegisterBL);
        cashRegister.appendChild(cashRegisterBL);

        let cashRegisterBR: GameObject = new GameObject("CashRegister", new f.Vector2(0.555, 0.238), new f.Vector3(0.277, 0.05, -0.277), f.Vector3.Y(90));
        let cmpMtrCashRegisterBR: f.ComponentMaterial = new f.ComponentMaterial(mtrCashRegisterBS);
        cashRegisterBR.addComponent(cmpMtrCashRegisterBR);
        cashRegister.appendChild(cashRegisterBR);

        let txtCashRegisterBT: f.TextureImage = new f.TextureImage("../Assets/CashRegister_BaseTop.png");
        let mtrCashRegisterBT: f.Material = new f.Material("CashRegister", f.ShaderTexture, new f.CoatTextured(clrWhite, txtCashRegisterBT));

        let cashRegisterBT: GameObject = new GameObject("CashRegister", new f.Vector2(0.555, 0.555), new f.Vector3(0, 0.116, -0.277), f.Vector3.X(-80));
        let cmpMtrCashRegisterBT: f.ComponentMaterial = new f.ComponentMaterial(mtrCashRegisterBT);
        cashRegisterBT.addComponent(cmpMtrCashRegisterBT);
        cashRegister.appendChild(cashRegisterBT);

        let txtCashRegisterF: f.TextureImage = new f.TextureImage("../Assets/CashRegister_Front.png");
        let mtrCashRegisterF: f.Material = new f.Material("CashRegister", f.ShaderTexture, new f.CoatTextured(clrWhite, txtCashRegisterF));

        let cashRegisterF: GameObject = new GameObject("CashRegister", new f.Vector2(0.555, 0.139), new f.Vector3(0, 0.23, -0.555), f.Vector3.ZERO());
        let cmpMtrCashRegisterF: f.ComponentMaterial = new f.ComponentMaterial(mtrCashRegisterF);
        cashRegisterF.addComponent(cmpMtrCashRegisterF);
        cashRegister.appendChild(cashRegisterF);

        root.appendChild(cashRegister);
        // #endregion (CASH REGISTER)

        // #region (TRASHCAN)
        let txtTrashcan: f.TextureImage = new f.TextureImage("../Assets/Trashcan_Side.png");
        let mtrTrashcan: f.Material = new f.Material("Trashcan", f.ShaderTexture, new f.CoatTextured(clrWhite, txtTrashcan));
        trashcan = new GameObject("Trashcan", new f.Vector2(0.75, 1), new f.Vector3(sizeWall * numWalls / 2 - 1.5, 0.5, -8), f.Vector3.ZERO());
        let cmpMtrTrashcan: f.ComponentMaterial = new f.ComponentMaterial(mtrTrashcan);
        trashcan.addComponent(cmpMtrTrashcan);

        let trashcanL: GameObject = new GameObject("Trashcan_l", new f.Vector2(0.75, 1), new f.Vector3(-0.375, 0, -0.375), f.Vector3.Y(-90));
        let cmpMtrTrashcanL: f.ComponentMaterial = new f.ComponentMaterial(mtrTrashcan);
        trashcanL.addComponent(cmpMtrTrashcanL);
        trashcan.appendChild(trashcanL);

        let trashcanR: GameObject = new GameObject("Trashcan_r", new f.Vector2(0.75, 1), new f.Vector3(0.375, 0, -0.375), f.Vector3.Y(90));
        let cmpMtrTrashcanR: f.ComponentMaterial = new f.ComponentMaterial(mtrTrashcan);
        trashcanR.addComponent(cmpMtrTrashcanR);
        trashcan.appendChild(trashcanR);

        let trashcanT: GameObject = new GameObject("Trashcan_t", new f.Vector2(0.75, 0.75), new f.Vector3(0, 0.5, -0.375), f.Vector3.X(90));
        let txtTrashcanT: f.TextureImage = new f.TextureImage("../Assets/Trashcan_Top.png");
        let mtrTrashcanT: f.Material = new f.Material("Trashcan", f.ShaderTexture, new f.CoatTextured(clrWhite, txtTrashcanT));
        let cmpMtrTrashcanT: f.ComponentMaterial = new f.ComponentMaterial(mtrTrashcanT);
        trashcanT.addComponent(cmpMtrTrashcanT);
        trashcan.appendChild(trashcanT);

        root.appendChild(trashcan);
        // #endregion (TRASHCAN)

        // #region (INSTRUCTIONS)
        instructions = new GameObject("Instructions", new f.Vector2(0.6, 1), new f.Vector3(-sizeWall * numWalls / 2 + 0.001, 1.5, 0), f.Vector3.Y(90));
        let txtInstructions: f.TextureImage = new f.TextureImage("../Assets/Instructions.png");
        let mtrInstructions: f.Material = new f.Material("Instructions", f.ShaderTexture, new f.CoatTextured(clrWhite, txtInstructions));
        let cmpMtrInstructions: f.ComponentMaterial = new f.ComponentMaterial(mtrInstructions);
        instructions.addComponent(cmpMtrInstructions);
        root.appendChild(instructions);
        // #endregion (INSTRUCTIONS)

        let cmpCamera: f.ComponentCamera = new f.ComponentCamera();
        cmpCamera.projectCentral(1, 45, f.FIELD_OF_VIEW.DIAGONAL, 0.2, 10000);
        cmpCamera.pivot.translate(f.Vector3.Y(1.55)); // ->Augenhöhe des Avatars
        cmpCamera.backgroundColor = f.Color.CSS("purple");

        avatar.addComponent(cmpCamera);
        avatar.addComponent(new f.ComponentTransform());
        avatar.mtxLocal.translate(f.Vector3.Z(9));
        avatar.mtxLocal.rotate(f.Vector3.Y(180));
        root.appendChild(avatar);

        viewport = new f.Viewport();
        viewport.initialize("Viewport", root, cmpCamera, canvas);
        viewport.draw();

        f.AudioManager.default.listenTo(root);
        f.AudioManager.default.listenWith(avatar.getComponent(f.ComponentAudioListener));

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

        f.Loop.addEventListener(f.EVENT.LOOP_FRAME, hndLoop);
        f.Loop.start(f.LOOP_MODE.TIME_GAME, 120);
    }


    function hndLoop(_event: Event): void {
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
            let pickedOption: number;
            if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.SPACE])) {
                exitMachine();
            } else if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.ONE])) {
                pickedOption = 1;
                addAttribute(pickedOption);
                exitMachine();
            } else if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.TWO])) {
                pickedOption = 2;
                addAttribute(pickedOption);
                exitMachine();
            } else if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.THREE])) {
                pickedOption = 3;
                addAttribute(pickedOption);
                exitMachine();
            } else if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.FOUR])) {
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

        ctrSpeed.setInput(
            f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.S, f.KEYBOARD_CODE.ARROW_DOWN])
            + f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.W, f.KEYBOARD_CODE.ARROW_UP])
        );
        ctrStrafe.setInput(
            f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.A, f.KEYBOARD_CODE.ARROW_LEFT])
            + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.D, f.KEYBOARD_CODE.ARROW_RIGHT])
        );
        moveAvatar(ctrSpeed.getOutput(), ctrRotation.getOutput(), ctrStrafe.getOutput());
        ctrRotation.setInput(0);


        if (customerTimer.get() >= spawnTime && customers.nChildren < 9) {
            generateCustomer();
            customerTimer.set(0);
        }

        if (endlessMode) {
            if (failOrders > 0)
                endGame();
        } else {
            if (clockTimer.get() / 1000 >= 60) {
                clock++;
                clockTimer.set(0);
                updateClock();
            }
        }

        for (let i: number = 0; i < 4; i++) {
            let currentMachine: Machine = <Machine>machines.getChild(i);
            currentMachine.update();
        }

        for (let customer of customers.getChildren() as Customer[]) {
            if (customer != undefined && customer.getParent() != null)
                customer.update();
        }

        if (activeBooster)
            updateBooster();

        viewport.draw();
    }


    function startGame(): void {
        document.getElementById("menu").setAttribute("style", "visibility: hidden");
        document.getElementById("optionsDiv").setAttribute("style", "visibility: hidden");
        document.getElementById("controlsDiv").setAttribute("style", "visibility: hidden");
        gameState = GAMESTATE.PLAY;
        menuMusic.play(false);
        backgroundMusic.play(true);
        clockTimer = new f.Time;
        customerTimer = new f.Time;
    }


    function hndMouse(_event: MouseEvent): void {
        ctrRotation.setInput(_event.movementX);
    }


    function moveAvatar(_speed: number, _rotation: number, _strafe: number): void {
        avatar.mtxLocal.rotateY(_rotation);
        let posOld: f.Vector3 = avatar.mtxLocal.translation;
        avatar.mtxLocal.translateZ(_speed);
        avatar.mtxLocal.translateX(_strafe);
        // WALL BOUNCE
        let bouncedOff1: Wall[] = bounceOffWalls(<Wall[]>walls.getChildren());
        if (bouncedOff1.length < 2)
            return;

        bouncedOff1 = bounceOffWalls(bouncedOff1);
        if (bouncedOff1.length == 0)
            return;
        //
        console.log("Stuck!");
        avatar.mtxLocal.translation = posOld;
    }


    function createWalls(): f.Node {
        let walls: f.Node = new f.Node("Walls");

        let txtWall: f.TextureImage = new f.TextureImage("../Assets/Wall.png");
        let mtrWall: f.Material = new f.Material("Wall", f.ShaderTexture, new f.CoatTextured(clrWhite, txtWall));

        for (let i: number = -numWalls / 2 + 0.5; i < numWalls / 2; i++) {
            walls.appendChild(new Wall(f.Vector2.ONE(sizeWall), f.Vector3.SCALE(new f.Vector3(-numWalls / 2, 0.5, i), sizeWall), f.Vector3.Y(90), mtrWall)); // left
            walls.appendChild(new Wall(f.Vector2.ONE(sizeWall), f.Vector3.SCALE(new f.Vector3(numWalls / 2, 0.5, i), sizeWall), f.Vector3.Y(-90), mtrWall)); // right
            //walls.appendChild(new Wall(f.Vector2.ONE(sizeWall), f.Vector3.SCALE(new f.Vector3(i, 0.5, -numWalls / 2), sizeWall), f.Vector3.Y(0), mtrWall)); // front
            walls.appendChild(new Wall(f.Vector2.ONE(sizeWall), f.Vector3.SCALE(new f.Vector3(i, 0.5, numWalls / 2), sizeWall), f.Vector3.Y(180), mtrWall)); // back

            walls.appendChild(new Wall(f.Vector2.ONE(sizeWall), f.Vector3.SCALE(new f.Vector3(i, 0.5, -numWalls / 2 + 1.5), sizeWall), f.Vector3.Y(0))); // invisible front (counters)
            walls.appendChild(new Wall(f.Vector2.ONE(sizeWall), f.Vector3.SCALE(new f.Vector3(i, 0.5, numWalls / 2 - 1), sizeWall), f.Vector3.Y(180))); // invisible back (machines)
        }
        // front:
        let txtDoor: f.TextureImage = new f.TextureImage("../Assets/Door.png");
        let mtrDoor: f.Material = new f.Material("Door", f.ShaderTexture, new f.CoatTextured(clrWhite, txtDoor));
        walls.appendChild(new Wall(f.Vector2.ONE(sizeWall), f.Vector3.SCALE(new f.Vector3(-numWalls / 2 + 0.5, 0.5, -numWalls / 2), sizeWall), f.Vector3.Y(0), mtrDoor)); // door
        walls.appendChild(new Wall(f.Vector2.ONE(sizeWall), f.Vector3.SCALE(new f.Vector3(-numWalls / 2 + 1.5, 0.5, -numWalls / 2), sizeWall), f.Vector3.Y(0), mtrWall)); // wall
        let txtWindowL: f.TextureImage = new f.TextureImage("../Assets/Window_L.png");
        let mtrWindowL: f.Material = new f.Material("WindowL", f.ShaderTexture, new f.CoatTextured(clrWhite, txtWindowL));
        let txtWindowR: f.TextureImage = new f.TextureImage("../Assets/Window_R.png");
        let mtrWindowR: f.Material = new f.Material("WindowR", f.ShaderTexture, new f.CoatTextured(clrWhite, txtWindowR));
        walls.appendChild(new Wall(f.Vector2.ONE(sizeWall), f.Vector3.SCALE(new f.Vector3(-numWalls / 2 + 2.5, 0.5, -numWalls / 2), sizeWall), f.Vector3.Y(0), mtrWindowL)); // windowL
        walls.appendChild(new Wall(f.Vector2.ONE(sizeWall), f.Vector3.SCALE(new f.Vector3(-numWalls / 2 + 3.5, 0.5, -numWalls / 2), sizeWall), f.Vector3.Y(0), mtrWindowR)); // windowR
        walls.appendChild(new Wall(f.Vector2.ONE(sizeWall), f.Vector3.SCALE(new f.Vector3(-numWalls / 2 + 4.5, 0.5, -numWalls / 2), sizeWall), f.Vector3.Y(0), mtrWall)); // wall
        walls.appendChild(new Wall(f.Vector2.ONE(sizeWall), f.Vector3.SCALE(new f.Vector3(-numWalls / 2 + 5.5, 0.5, -numWalls / 2), sizeWall), f.Vector3.Y(0), mtrWindowL)); // windowL
        walls.appendChild(new Wall(f.Vector2.ONE(sizeWall), f.Vector3.SCALE(new f.Vector3(-numWalls / 2 + 6.5, 0.5, -numWalls / 2), sizeWall), f.Vector3.Y(0), mtrWindowR)); // windowR
        walls.appendChild(new Wall(f.Vector2.ONE(sizeWall), f.Vector3.SCALE(new f.Vector3(-numWalls / 2 + 7.5, 0.5, -numWalls / 2), sizeWall), f.Vector3.Y(0), mtrWall)); // wall

        return walls;
    }


    function createCounter(): f.Node {
        let counter: f.Node = new f.Node("Counter");

        let txtCounterSide: f.TextureImage = new f.TextureImage("../Assets/CounterSide.png");
        let mtrCounterSide: f.Material = new f.Material("CounterSide", f.ShaderTexture, new f.CoatTextured(clrWhite, txtCounterSide));
        let txtCounterTop: f.TextureImage = new f.TextureImage("../Assets/CounterTop.png");
        let mtrCounterTop: f.Material = new f.Material("CounterTop", f.ShaderTexture, new f.CoatTextured(clrWhite, txtCounterTop));

        for (let i: number = -numWalls * sizeWall / 3 - 0.5; i < numWalls * sizeWall / 3 + 1; i++) {
            counter.appendChild(new Counter(new f.Vector2(1, 1), new f.Vector3(i, 0.5, -8), new f.Vector3(0, 0, 0), mtrCounterSide)); // front
            counter.appendChild(new Counter(new f.Vector2(1, 1), new f.Vector3(i, 1, -8.5), new f.Vector3(90, 0, 0), mtrCounterTop)); // top
        }
        counter.appendChild(new Counter(new f.Vector2(1, 1), new f.Vector3(sizeWall * (numWalls - 2) * -0.5, 0.5, -8.5), f.Vector3.Y(-90), mtrCounterSide)); // left
        counter.appendChild(new Counter(new f.Vector2(1, 1), new f.Vector3(sizeWall * (numWalls - 2) * 0.5, 0.5, -8.5), f.Vector3.Y(90), mtrCounterSide)); // right

        return counter;
    }


    function createMachines(): f.Node {
        let machines: f.Node = new f.Node("Machines");

        let txtMachine: f.TextureImage = new f.TextureImage("../Assets/Machine.png");
        let mtrMachine: f.Material = new f.Material("Appearance", f.ShaderTexture, new f.CoatTextured(clrWhite, txtMachine));
        let txtMachineSide: f.TextureImage = new f.TextureImage("../Assets/Machine_Side.png");
        let mtrMachineSide: f.Material = new f.Material("Appearance", f.ShaderTexture, new f.CoatTextured(clrWhite, txtMachineSide));

        for (let i: number = 0; i < 4; i++) {
            machines.appendChild(new Machine("Machine_" + (i + 1), new f.Vector2(2, 2), new f.Vector3(-9 + i * 6, 1, 10), f.Vector3.Y(180), mtrMachine)); // front
            machines.getChild(i).appendChild(new Machine("Machine_L" + (i + 1), new f.Vector2(2, 2), new f.Vector3(-1, 0, -1), f.Vector3.Y(-90), mtrMachineSide)); // left
            machines.getChild(i).appendChild(new Machine("Machine_R" + (i + 1), new f.Vector2(2, 2), new f.Vector3(1, 0, -1), f.Vector3.Y(90), mtrMachineSide)); // right
            // conveyor belt
            if (i < 3) {
                let conveyorBeltTop: GameObject = new GameObject("ConveyorBelt", new f.Vector2(4, 1), new f.Vector3(-6 + i * 6, 1, 11), new f.Vector3(-90, 180, 0));
                let conveyorBeltFront: GameObject = new GameObject("ConveyorBelt", new f.Vector2(4, 0.5), new f.Vector3(-6 + i * 6, 0.75, 10.5), f.Vector3.Y(180));

                let txtTop: f.TextureImage = new f.TextureImage("../Assets/ConveyorBelt_Top.png");
                let txtFront: f.TextureImage = new f.TextureImage("../Assets/ConveyorBelt_Front.png");

                let mtrTop: f.Material = new f.Material("Appearance", f.ShaderTexture, new f.CoatTextured(clrWhite, txtTop));
                let mtrFront: f.Material = new f.Material("Appearance", f.ShaderTexture, new f.CoatTextured(clrWhite, txtFront));

                let cmpMtrTop: f.ComponentMaterial = new f.ComponentMaterial(mtrTop);
                let cmpMtrFront: f.ComponentMaterial = new f.ComponentMaterial(mtrFront);

                conveyorBeltTop.addComponent(cmpMtrTop);
                conveyorBeltFront.addComponent(cmpMtrFront);

                conveyorBelts.appendChild(conveyorBeltTop);
                conveyorBelts.appendChild(conveyorBeltFront);
            }
        }
        root.appendChild(conveyorBelts);

        return machines;
    }


    function bounceOffWalls(_walls: Wall[]): Wall[] {
        let bouncedOff: Wall[] = [];
        let posAvatar: f.Vector3 = avatar.mtxLocal.translation;

        for (let wall of _walls) {
            let posBounce: f.Vector3 = wall.calculateBounce(posAvatar, 1);
            if (posBounce) {
                avatar.mtxLocal.translation = posBounce;
                bouncedOff.push(wall);
            }
        }
        return bouncedOff;
    }

    // #region (INTERACT FUNCTIONS)
    function interact(): void {
        lookAtInstructions();
        interactCustomer();
        interactMachine();
        pickUpTeddy();
        throwAwayTeddy();
    }

    function hndlInteract(object: f.Node): number[] { // returns distanceOI (Object - Intersection) & distanceOA (Object - Avatar)
        // CHECKING IF OBJECT BEHIND AVATAR:
        let localObject: f.Vector3 = f.Vector3.TRANSFORMATION(object.mtxWorld.translation, avatar.mtxWorldInverse, true);
        if (localObject.z < 0) {
            return null;
        }
        // DISTANCE OBJECT-INTERSECTION:
        let ray: f.Ray = new f.Ray(avatar.mtxWorld.getZ(), avatar.mtxWorld.translation, 20);
        let intersect: f.Vector3 = ray.intersectPlane(object.mtxWorld.translation, object.mtxWorld.getZ());
        let vctDistance: f.Vector3 = f.Vector3.DIFFERENCE(object.mtxWorld.translation, intersect);
        let distanceOI: number = Math.sqrt(Math.pow(vctDistance.x, 2) + Math.pow(vctDistance.y, 2) + Math.pow(vctDistance.z, 2));
        // DISTANCE OBJECT-AVATAR:
        let vctAvatar: f.Vector3 = f.Vector3.DIFFERENCE(avatar.mtxWorld.translation, object.mtxWorld.translation);
        let distanceOA: number = f.Vector3.DOT(vctAvatar, object.mtxWorld.getZ());

        let distances: number[] = [distanceOI, distanceOA];
        return distances;
    }

    function lookAtInstructions(): void {
        if (hndlInteract(instructions) != null) {
            let distances: number[] = hndlInteract(instructions);
            let distanceOI: number = distances[0];
            let distanceOA: number = distances[1];

            if (distanceOI < 2 && distanceOA < 3) {
                document.getElementById("instructions").setAttribute("style", "visibility: visible");
                gameState = GAMESTATE.PAUSE;
            }
        }
    }

    function interactCustomer(): void {
        for (let customer of customers.getChildren() as Customer[]) {
            if (hndlInteract(customer) != null) {
                let distances: number[] = hndlInteract(customer);
                let distanceOI: number = distances[0];
                let distanceOA: number = distances[1];

                if (distanceOI < 1.1 && distanceOA < 5 && customer.cmpStateMachine.stateCurrent == ACTION.WAITING_HAPPY || customer.cmpStateMachine.stateCurrent == ACTION.WAITING_ANGRY) {
                    if (avatar.getChild(1) == undefined) { // take order
                        customer.showOrder();
                    } else {
                        if (customer.checkOrder(<TeddyBear>avatar.getChild(1))) { // give teddy bear
                            avatar.removeChild(avatar.getChild(1));
                            money += 80;
                            moneySound.play(true);
                            succOrders++;
                            customer.cmpStateMachine.stateCurrent = ACTION.LEAVING;
                        } else { // if teddy is wrong
                            customer.cmpAudDeny.play(true);
                        }
                    }
                }
            }
        }
    }

    function interactMachine(): void {
        for (let machine of machines.getChildren() as Machine[]) {
            if (hndlInteract(machine) != null) {
                let distances: number[] = hndlInteract(machine);
                let distanceOI: number = distances[0];
                let distanceOA: number = distances[1];
                // display machine-screen
                if (distanceOI < 1.1 && distanceOA < 5 && machine.cmpStateMachine.stateCurrent == STATE.WAITING) {
                    gameState = GAMESTATE.MACHINE;
                    document.getElementById("machineInput").setAttribute("style", "visibility: visible");
                    document.getElementById("fur").setAttribute("style", "visibility: hidden");
                    document.getElementById("eyecolor").setAttribute("style", "visibility: hiddden");
                    document.getElementById("accessory").setAttribute("style", "visibility: hidden");
                    document.getElementById("sound").setAttribute("style", "visibility: hidden");
                    switch (machine) {
                        case machines.getChild(0):
                            document.getElementById("fur").setAttribute("style", "visibility: visible");
                            document.getElementById("teddyBear").innerHTML = "";
                            selectedMachine = machine;
                            break;
                        case machines.getChild(1):
                            document.getElementById("eyecolor").setAttribute("style", "visibility: visible");
                            document.getElementById("teddyBear").innerHTML = (<TeddyBear>machine.getChild(2)).fur.name;
                            selectedMachine = machine;
                            break;
                        case machines.getChild(2):
                            document.getElementById("accessory").setAttribute("style", "visibility: visible");
                            document.getElementById("teddyBear").innerHTML = (<TeddyBear>machine.getChild(2)).fur.name + ", " + (<TeddyBear>machine.getChild(2)).eyecolor.name;
                            selectedMachine = machine;
                            break;
                        case machines.getChild(3):
                            document.getElementById("sound").setAttribute("style", "visibility: visible");
                            document.getElementById("teddyBear").innerHTML = (<TeddyBear>machine.getChild(2)).fur.name + ", " + (<TeddyBear>machine.getChild(2)).eyecolor.name + ", " + (<TeddyBear>machine.getChild(2)).accessory.name;
                            selectedMachine = machine;
                            break;
                        default:
                            break;
                    }
                }
            }
        }
    }

    function pickUpTeddy(): void {
        if (avatar.getChild(1) == undefined) {
            for (let teddy of machines.getChild(3).getChildren() as TeddyBear[]) {
                if (hndlInteract(teddy) != null) {
                    let distances: number[] = hndlInteract(teddy);
                    let distanceOI: number = distances[0];
                    let distanceOA: number = distances[1];
    
                    if (distanceOI < 2 && distanceOA < 5 && (<Machine>machines.getChild(3)).cmpStateMachine.stateCurrent == STATE.FINISHED) {
                        if (teddy.progress == 4) {
                            avatar.appendChild(teddy);
                            teddy.mtxLocal.translate(new f.Vector3(0, 1.25, -2.5));
                            teddy.sound.getComponent(f.ComponentAudio).play(true);
                        }
                    }
                }
            }
        }
    }

    function throwAwayTeddy(): void {
        if (hndlInteract(trashcan) != null) {
            let distances: number[] = hndlInteract(trashcan);
            let distanceOI: number = distances[0];
            let distanceOA: number = distances[1];

            if (distanceOI < 1.1 && distanceOA < 5) {
                avatar.removeChild(avatar.getChild(1));
            }
        }
    }
    // #endregion (INTERACT FUNCTIONS)

    function exitMachine(): void {
        document.getElementById("machineInput").setAttribute("style", "visibility: hidden");
        document.getElementById("fur").setAttribute("style", "visibility: hidden");
        document.getElementById("eyecolor").setAttribute("style", "visibility: hiddden");
        document.getElementById("accessory").setAttribute("style", "visibility: hidden");
        document.getElementById("sound").setAttribute("style", "visibility: hidden");
        selectedMachine = null;
        gameState = GAMESTATE.PLAY;
    }


    function addAttribute(_option: number): void {
        let teddyInside: TeddyBear = <TeddyBear>selectedMachine.getChild(2);

        if (selectedMachine.index == 0) {
            if (selectedMachine.getChild(2) == undefined) {
                selectedMachine.appendChild(new TeddyBear(new f.Vector2(0.5, 0.5), new f.Vector3(0, 0, 0), f.Vector3.Y(180), _option));
                selectedMachine.getChild(2).mtxLocal.translateZ(1);
                selectedMachine.cmpStateMachine.stateCurrent = STATE.WORKING;
            }
        } else if (teddyInside.progress == 1 && selectedMachine.index == 1) {
            teddyInside.addEyecolor(_option);
            selectedMachine.cmpStateMachine.stateCurrent = STATE.WORKING;
        } else if (teddyInside.progress == 2 && selectedMachine.index == 2) {
            teddyInside.addAccessory(_option);
            selectedMachine.cmpStateMachine.stateCurrent = STATE.WORKING;
        } else if (teddyInside.progress == 3 && selectedMachine.index == 3) {
            teddyInside.addSound(_option);
            selectedMachine.cmpStateMachine.stateCurrent = STATE.WORKING;
        }
    }

    function generateCustomer(): void { // generates random customer // ISSUE: CUSTOMER HAS TO TAKE FREE SPACE; FIX THE USE OF "INDEX" (or just make max. customers per day = 9)
        let randomAppearance: number = Math.floor(Math.random() * 6 + 1); // generates number from 1 - 6
        let txtCustomer: f.TextureImage = new f.TextureImage("../Assets/Customer_" + randomAppearance + ".png");
        let mtrCustomer: f.Material = new f.Material("Appearance", f.ShaderTexture, new f.CoatTextured(clrWhite, txtCustomer));
        let customer: Customer = new Customer(new f.Vector2(1, 2), new f.Vector3(-10.5, 1, -10), new f.Vector3(0, 0, 0), mtrCustomer);

        customer.posTarget = customerPositions[index];
        if (index == numWalls) {
            index = 0;
        } else {
            index++;
        }

        customers.appendChild(customer);
        newCustomerAud.play(true);
    }

    function createPositions(): f.Vector3[] {
        let positions: f.Vector3[] = [];
        let j: number = 0;
        for (let i: number = -numWalls * sizeWall / 3; i < numWalls * sizeWall / 3 + 1; i += 2) {
            positions[j] = new f.Vector3(i, 1, -10);
            j++;
        }
        return positions;
    }


    function updateClock(): void { // shift goes from 10am to 4pm
        (<HTMLImageElement>document.getElementById("clockImg")).src = "../Assets/Clock" + clock + ".png";
        if (clock == 6)
            endGame();
    }


    function hndlBooster(): void {
        if (!activeBooster && collectedBooster) {
            boosterSound.play(true);
            for (let i: number = 0; i < 4; i++) { // apply boost to machines
                let currentMachine: Machine = <Machine>machines.getChild(i);
                currentMachine.productionTime = machineTime * 0.3;
            }
            activeBooster = true;
            (<HTMLImageElement>document.getElementById("boosterImg")).src = "../Assets/Booster_Active.png";
            boosterTimer.set(0);
        }
    }


    function updateBooster(): void {
        if (activeBooster && boosterTimer.get() / 1000 >= 30) {
            for (let i: number = 0; i < 4; i++) { //remove boost from machines
                let currentMachine: Machine = <Machine>machines.getChild(i);
                currentMachine.productionTime = machineTime;
            }
            activeBooster = false;
            (<HTMLImageElement>document.getElementById("boosterImg")).src = "../Assets/Booster_Empty.png";
            collectedBooster = false;
        }
    }


    function endGame(): void {
        gameState = GAMESTATE.END;
        finishSound.play(true);
        backgroundMusic.play(false);
        document.getElementById("transparentDiv").setAttribute("style", "visibility: visible");
        document.getElementById("endscore").setAttribute("style", "visibility: visible");
        document.getElementById("money").innerHTML = money + "$";
        document.getElementById("succOrders").innerHTML = "" + succOrders;
        document.getElementById("failOrders").innerHTML = "" + failOrders;
        switch (difficulty) {
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
        document.getElementById("score").innerHTML = "" + (money * 2 + succOrders - failOrders + difficulty * 10) * 100;
    }

    // #region (MENU FUNCTIONS)
    function showOptions(): void {
        document.getElementById("controlsDiv").setAttribute("style", "visibility: hidden");
        document.getElementById("optionsDiv").setAttribute("style", "visibility: visible");
    }
    function showControls(): void {
        document.getElementById("optionsDiv").setAttribute("style", "visibility: hidden");
        document.getElementById("controlsDiv").setAttribute("style", "visibility: visible");
    }

    function setDifficulty0(): void {
        document.getElementById("difficulty_0").setAttribute("style", "background-color: rgb(255, 157, 170)");
        document.getElementById("difficulty_1").setAttribute("style", "background-color: rgb(255, 249, 243)");
        document.getElementById("difficulty_2").setAttribute("style", "background-color: rgb(255, 249, 243)");
        setParameters(parametersArray[0].difficulty);
    }
    function setDifficulty1(): void {
        document.getElementById("difficulty_0").setAttribute("style", "background-color: rgb(255, 249, 243)");
        document.getElementById("difficulty_1").setAttribute("style", "background-color: rgb(255, 157, 170)");
        document.getElementById("difficulty_2").setAttribute("style", "background-color: rgb(255, 249, 243)");
        setParameters(parametersArray[1].difficulty);
    }
    function setDifficulty2(): void {
        document.getElementById("difficulty_0").setAttribute("style", "background-color: rgb(255, 249, 243)");
        document.getElementById("difficulty_1").setAttribute("style", "background-color: rgb(255, 249, 243)");
        document.getElementById("difficulty_2").setAttribute("style", "background-color: rgb(255, 157, 170)");
        setParameters(parametersArray[2].difficulty);
    }
    function setParameters(difficulty: number): void {
        difficulty = parametersArray[difficulty].difficulty;
        machineTime = parametersArray[difficulty].machineTime;
        customerTime = parametersArray[difficulty].customerTime;
        spawnTime = parametersArray[difficulty].spawnTime;
    }

    function setMode0(): void {
        document.getElementById("mode_0").setAttribute("style", "background-color: rgb(255, 157, 170)");
        document.getElementById("mode_1").setAttribute("style", "background-color: rgb(255, 249, 243)");
        endlessMode = false;
        document.getElementById("clock").setAttribute("style", "visibility: visible");
    }
    function setMode1(): void {
        document.getElementById("mode_0").setAttribute("style", "background-color: rgb(255, 249, 243)");
        document.getElementById("mode_1").setAttribute("style", "background-color: rgb(255, 157, 170)");
        endlessMode = true;
        document.getElementById("clock").setAttribute("style", "visibility: hidden");
    }
    // #endregion (MENU FUNCTIONS)
}