const { ccclass, property } = cc._decorator;

@ccclass
export default class HoverScaler extends cc.Component {

    @property(cc.Node)
    targetNode: cc.Node = null;

    @property(cc.Float)
    maxScale: number = 1.5;

    @property(cc.Float)
    transitionTime: number = 0.5;

    private originalScale: number = 1;

    onLoad() {

        if(!this.targetNode){
            this.targetNode = this.node;
        }
    
        this.originalScale = this.targetNode.scaleX;
        this.targetNode.on(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.targetNode.on(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this); 
    }

    onDestroy() {
        if (this.targetNode) {
            this.targetNode.off(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
            this.targetNode.off(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        }
    }

    onMouseEnter() {
        if (this.targetNode) {
            cc.tween(this.targetNode)
                .to(this.transitionTime, { scaleX: this.maxScale, scaleY: this.maxScale })
                .start();
        }
    }

    onMouseLeave() {
        if (this.targetNode) {
            cc.tween(this.targetNode)
                .to(this.transitionTime, { scaleX: this.originalScale, scaleY: this.originalScale })
                .start();
        }
    }
}