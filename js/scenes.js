class AlarmScene {
    constructor() {
        this.container = new PIXI.Container();
    }

    draw() {
        let graphics = new PIXI.Graphics();
        // Background
        graphics.drawRect(0, 0, window.innerWidth, window.innerHeight);
        let text = new PIXI.Text("MASTER ALARM",{
            fill: 0xffcc00,
            fontFamily:"Arial",
            fontSize: 100,
        });
        text.position = new PIXI.Point(window.innerWidth / 2, window.innerHeight/2);
        this.container.addChild(graphics);
        this.container.addChild(text);
        app.stage.addChild(this.container);
    }
}