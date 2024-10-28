const { ccclass, property, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
export default class VerticalLayout extends cc.Component {

    @property(cc.Node)
    parentNode: cc.Node = null;

    @property([cc.Node])
    childNodes: cc.Node[] = [];

    @property([cc.Float])
    percentageHeights: number[] = [];

    onLoad() {
        this.updateLayout();
        cc.view.on('canvas-resize', this.updateLayout, this);
    }

    onDestroy() {
        cc.view.off('canvas-resize', this.updateLayout, this);
    }

    updateLayout() {
        if (!this.parentNode) {
            cc.error("Parent node is not set.");
            return;
        }

        let parentHeight = this.parentNode.height;

        for (let i = 0; i < this.childNodes.length; i++) {
            let childNode = this.childNodes[i];
            let percentageHeight = this.percentageHeights[i];

            if (childNode && percentageHeight != null) {
                // Calculate the height based on the percentage
                let childHeight = parentHeight * (percentageHeight / 100);

                // Set the height of the child node
                childNode.height = childHeight;
            } else {
                cc.error("Child node or percentage height is not set correctly.");
            }
        }
    }

    protected update(dt: number): void {
        if(CC_EDITOR){
            this.updateLayout();
        }
    }
}

