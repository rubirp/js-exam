const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class FitterLayout extends cc.Component {

    @property(cc.Node)
    targetNode: cc.Node = null;

    @property(cc.Node)
    parentNode: cc.Node = null;

    onLoad() {
        this.updateScale();
        cc.view.on('canvas-resize', this.updateScale, this);
    }

    onDestroy() {
        cc.view.off('canvas-resize', this.updateScale, this);
    }

    updateScale() {
        if (!this.targetNode || !this.parentNode) {
            return;
        }

        let parentWidth = this.parentNode.width;
        let parentHeight = this.parentNode.height;
        let targetWidth = this.targetNode.width;
        let targetHeight = this.targetNode.height;

        let scaleX = parentWidth / targetWidth;
        let scaleY = parentHeight / targetHeight;

        // Choose the smaller scale factor to avoid empty space
        let scale = Math.min(scaleX, scaleY);

        // Apply the scale to the target node
        this.targetNode.scaleX = scale;
        this.targetNode.scaleY = scale;
    }

    protected update(dt: number): void {
        if(CC_EDITOR){
            this.updateScale();
        }
    }
}