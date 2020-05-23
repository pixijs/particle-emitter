import { Container, DisplayObject, Renderer, Rectangle, MaskData } from 'pixi.js';

export interface LinkedListChild extends DisplayObject
{
    nextChild: LinkedListChild|null;
    prevChild: LinkedListChild|null;
}

export class LinkedListContainer extends Container
{
    private _firstChild: LinkedListChild|null = null;
    private _lastChild: LinkedListChild|null = null;
    private _childCount = 0;

    public addChild<T extends DisplayObject[]>(...children: T): T[0]
    {
        // if there is only one argument we can bypass looping through the them
        if (children.length > 1)
        {
            // loop through the array and add all children
            for (let i = 0; i < children.length; i++)
            {
                // eslint-disable-next-line prefer-rest-params
                this.addChild(children[i]);
            }
        }
        else
        {
            const child = children[0] as LinkedListChild;
            // if the child has a parent then lets remove it as PixiJS objects can only exist in one place

            if (child.parent)
            {
                child.parent.removeChild(child);
            }

            (child as any).parent = this;
            this.sortDirty = true;

            // ensure child transform will be recalculated
            (child.transform as any)._parentID = -1;

            // add to list if we have a list
            if (this._lastChild)
            {
                this._lastChild.nextChild = child;
                child.prevChild = this._lastChild;
                this._lastChild = child;
            }
            // otherwise initialize the list
            else
            {
                this._firstChild = this._lastChild = child;
            }

            // update child count
            ++this._childCount;

            // ensure bounds will be recalculated
            (this as any)._boundsID++;

            this.emit('childAdded', child, this, this._childCount);
            child.emit('added', this);
        }

        return children[0];
    }

    public addChildAt<T extends DisplayObject>(child: T, index: number): T
    {
        if (index < 0 || index > this._childCount)
        {
            throw new Error(`${child}addChildAt: The index ${index} supplied is out of bounds ${this.children.length}`);
        }

        if (child.parent)
        {
            child.parent.removeChild(child);
        }

        (child as any).parent = this;
        this.sortDirty = true;

        // ensure child transform will be recalculated
        (child.transform as any)._parentID = -1;

        const c = (child as any) as LinkedListChild;

        // if no children, do basic initialization
        if (!this._firstChild)
        {
            this._firstChild = this._lastChild = c;
        }
        else
        {
            // add at beginning (back)
            if (index === 0)
            {
                this._firstChild.prevChild = c;
                c.nextChild = this._firstChild;
                this._firstChild = c;
            }
            // add at end (front)
            else if (index === this._childCount)
            {
                this._lastChild.nextChild = c;
                c.prevChild = this._lastChild;
                this._lastChild = c;
            }
            // otherwise we have to start counting through the children to find the right one
            // - SLOW, only provided to fully support the possibility of use
            else
            {
                let i = 0;
                let target = this._firstChild;

                while (i < index)
                {
                    target = target.nextChild;
                    ++i;
                }
                // insert before the target that we found at the specified index
                target.prevChild.nextChild = c;
                c.prevChild = target.prevChild;
                c.nextChild = target;
                target.prevChild = c;
            }
            this.children.splice(index, 0, child);
        }

        // update child count
        ++this._childCount;

        // ensure bounds will be recalculated
        (this as any)._boundsID++;

        child.emit('added', this);
        this.emit('childAdded', child, this, index);

        return child;
    }

    /**
     * Removes one or more children from the container.
     *
     * @param {...PIXI.DisplayObject} children - The DisplayObject(s) to remove
     * @return {PIXI.DisplayObject} The first child that was removed.
     */
    public removeChild<T extends DisplayObject[]>(...children: T): T[0]
    {
        // if there is only one argument we can bypass looping through the them
        if (children.length > 1)
        {
            // loop through the arguments property and remove all children
            for (let i = 0; i < children.length; i++)
            {
                this.removeChild(children[i]);
            }
        }
        else
        {
            const child = children[0] as LinkedListChild;

            // bail if not actually our child
            if ((child as any).parent !== this) return null;

            (child as any).parent = null;
            // ensure child transform will be recalculated
            (child.transform as any)._parentID = -1;

            // swap out child references
            if (child.nextChild)
            {
                child.nextChild.prevChild = child.prevChild;
            }
            if (child.prevChild)
            {
                child.prevChild.nextChild = child.nextChild;
            }
            if (this._firstChild === child)
            {
                this._firstChild = child.nextChild;
            }
            if (this._lastChild === child)
            {
                this._lastChild = child.prevChild;
            }
            child.nextChild = null;
            child.prevChild = null;

            // update child count
            --this._childCount;

            // ensure bounds will be recalculated
            (this as any)._boundsID++;

            child.emit('removed', this);
            this.emit('childRemoved', child, this);
        }

        return children[0];
    }

    /**
     * Returns the child at the specified index
     *
     * @param {number} index - The index to get the child at
     * @return {PIXI.DisplayObject} The child at the given index, if any.
     */
    getChildAt(index: number): DisplayObject
    {
        if (index < 0 || index >= this._childCount)
        {
            throw new Error(`getChildAt: Index (${index}) does not exist.`);
        }

        if (index === 0)
        {
            return this._firstChild;
        }
        // add at end (front)
        else if (index === this._childCount)
        {
            return this._lastChild;
        }
        // otherwise we have to start counting through the children to find the right one
        // - SLOW, only provided to fully support the possibility of use
        let i = 0;
        let target = this._firstChild;

        while (i < index)
        {
            target = target.nextChild;
            ++i;
        }

        return target;
    }

    /**
     * Removes a child from the specified index position. While this is functional, it is not
     * ideal, speed-wise.
     */
    public removeChildAt(index: number): DisplayObject
    {
        const child = this.getChildAt(index) as LinkedListChild;

        // ensure child transform will be recalculated..
        (child as any).parent = null;
        (child.transform as any)._parentID = -1;
        // swap out child references
        if (child.nextChild)
        {
            child.nextChild.prevChild = child.prevChild;
        }
        if (child.prevChild)
        {
            child.prevChild.nextChild = child.nextChild;
        }
        if (this._firstChild === child)
        {
            this._firstChild = child.nextChild;
        }
        if (this._lastChild === child)
        {
            this._lastChild = child.prevChild;
        }
        child.nextChild = null;
        child.prevChild = null;

        // update child count
        --this._childCount;

        // ensure bounds will be recalculated
        (this as any)._boundsID++;

        child.emit('removed', this);
        this.emit('childRemoved', child, this, index);

        return child;
    }

    /**
     * Updates the transform on all children of this container for rendering.
     * Copied from and overrides PixiJS v5 method (v4 method is identical)
     */
    updateTransform(): void
    {
        (this as any)._boundsID++;

        this.transform.updateTransform(this.parent.transform);

        // TODO: check render flags, how to process stuff here
        (this as any).worldAlpha = this.alpha * this.parent.worldAlpha;

        let child;
        let next;

        for (child = this._firstChild; child; child = next)
        {
            next = child.nextChild;

            if (child.visible)
            {
                child.updateTransform();
            }
        }
    }

    /**
     * Recalculates the bounds of the container.
     * Copied from and overrides PixiJS v5 method (v4 method is identical)
     *
     */
    calculateBounds(): void
    {
        this._bounds.clear();

        this._calculateBounds();

        let child;
        let next;

        for (child = this._firstChild; child; child = next)
        {
            next = child.nextChild;

            if (!child.visible || !child.renderable)
            {
                continue;
            }

            child.calculateBounds();

            // TODO: filter+mask, need to mask both somehow
            if ((child as any)._mask)
            {
                const maskObject = (((child as any)._mask as MaskData).maskObject || (child as any)._mask) as Container;

                maskObject.calculateBounds();
                this._bounds.addBoundsMask((child as any)._bounds, (maskObject as any)._bounds);
            }
            else if (child.filterArea)
            {
                this._bounds.addBoundsArea((child as any)._bounds, child.filterArea);
            }
            else
            {
                this._bounds.addBounds((child as any)._bounds);
            }
        }

        (this._bounds as any).updateID = (this as any)._boundsID;
    }

    /**
     * Retrieves the local bounds of the displayObject as a rectangle object. Copied from and overrides PixiJS v5 method
     */
    public getLocalBounds(rect?: Rectangle, skipChildrenUpdate = false): Rectangle
    {
        const result = super.getLocalBounds(rect);

        if (!skipChildrenUpdate)
        {
            let child;
            let next;

            for (child = this._firstChild; child; child = next)
            {
                next = child.nextChild;

                if (child.visible)
                {
                    child.updateTransform();
                }
            }
        }

        return result;
    }

    /**
     * Renders the object using the WebGL renderer. Copied from and overrides PixiJS v5 method
     */
    render(renderer: Renderer): void
    {
        // if the object is not visible or the alpha is 0 then no need to render this element
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
        {
            return;
        }

        // do a quick check to see if this element has a mask or a filter.
        if (this._mask || (this.filters && this.filters.length))
        {
            this.renderAdvanced(renderer);
        }
        else
        {
            let child;
            let next;

            // simple render children!
            for (child = this._firstChild; child; child = next)
            {
                next = child.nextChild;
                child.render(renderer);
            }
        }
    }

    /**
     * Render the object using the WebGL renderer and advanced features. Copied from and overrides PixiJS v5 method
     */
    protected renderAdvanced(renderer: Renderer): void
    {
        renderer.batch.flush();

        const filters = this.filters;
        const mask = this._mask;

        // _enabledFilters note: As of development, _enabledFilters is not documented in pixi.js
        // types but is in code of current release (5.2.4).

        // push filter first as we need to ensure the stencil buffer is correct for any masking
        if (filters)
        {
            if (!(this as any)._enabledFilters)
            {
                (this as any)._enabledFilters = [];
            }

            (this as any)._enabledFilters.length = 0;

            for (let i = 0; i < filters.length; i++)
            {
                if (filters[i].enabled)
                {
                    (this as any)._enabledFilters.push(filters[i]);
                }
            }

            if ((this as any)._enabledFilters.length)
            {
                renderer.filter.push(this, (this as any)._enabledFilters);
            }
        }

        if (mask)
        {
            renderer.mask.push(this, this._mask);
        }

        let child;
        let next;

        // now loop through the children and make sure they get rendered
        for (child = this._firstChild; child; child = next)
        {
            next = child.nextChild;
            child.render(renderer);
        }

        renderer.batch.flush();

        if (mask)
        {
            renderer.mask.pop(this);
        }

        if (filters && (this as any)._enabledFilters && (this as any)._enabledFilters.length)
        {
            renderer.filter.pop();
        }
    }

    /**
     * Renders the object using the WebGL renderer. Copied from and overrides PixiJS V4 method.
     */
    renderWebGL(renderer: any): void
    {
        // if the object is not visible or the alpha is 0 then no need to render this element
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
        {
            return;
        }

        // do a quick check to see if this element has a mask or a filter.
        if (this._mask || (this.filters && this.filters.length))
        {
            this.renderAdvancedWebGL(renderer);
        }
        else
        {
            let child;
            let next;

            // simple render children!
            for (child = this._firstChild; child; child = next)
            {
                next = child.nextChild;
                (child as any).renderWebGL(renderer);
            }
        }
    }

    /**
     * Render the object using the WebGL renderer and advanced features. Copied from and overrides PixiJS V4 method.
     */
    private renderAdvancedWebGL(renderer: any): void
    {
        renderer.flush();

        // _filters is a v4 specific property
        const filters = (this as any)._filters;
        const mask = this._mask;

        // push filter first as we need to ensure the stencil buffer is correct for any masking
        if (filters)
        {
            if (!(this as any)._enabledFilters)
            {
                (this as any)._enabledFilters = [];
            }

            (this as any)._enabledFilters.length = 0;

            for (let i = 0; i < filters.length; i++)
            {
                if (filters[i].enabled)
                {
                    (this as any)._enabledFilters.push(filters[i]);
                }
            }

            if ((this as any)._enabledFilters.length)
            {
                renderer.filterManager.pushFilter(this, (this as any)._enabledFilters);
            }
        }

        if (mask)
        {
            renderer.maskManager.pushMask(this, this._mask);
        }

        let child;
        let next;

        // now loop through the children and make sure they get rendered
        for (child = this._firstChild; child; child = next)
        {
            next = child.nextChild;
            (child as any).renderWebGL(renderer);
        }

        renderer.flush();

        if (mask)
        {
            renderer.maskManager.popMask(this, this._mask);
        }

        if (filters && (this as any)._enabledFilters && (this as any)._enabledFilters.length)
        {
            renderer.filterManager.popFilter();
        }
    }

    /**
     * Renders the object using the Canvas renderer. Copied from and overrides PixiJS V4 method or Canvas mixin in V5.
     */
    renderCanvas(renderer: any): void
    {
        // if not visible or the alpha is 0 then no need to render this
        if (!this.visible || this.worldAlpha <= 0 || !this.renderable)
        {
            return;
        }

        if (this._mask)
        {
            renderer.maskManager.pushMask(this._mask);
        }

        let child;
        let next;

        for (child = this._firstChild; child; child = next)
        {
            next = child.nextChild;
            (child as any).renderCanvas(renderer);
        }

        if (this._mask)
        {
            renderer.maskManager.popMask(renderer);
        }
    }
}
