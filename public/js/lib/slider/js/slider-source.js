/**
 * 图片滑动模块
 * @author zym
 * @version 1.0
 * @since 2016-01-27
 */

define(function(require, exports, module) {
    // 图片轮播组件
    var cssPrefix = $.fx.cssPrefix,
        transitionEnd = $.fx.transitionEnd,

    // todo 检测3d是否支持。
        translateZ = ' translateZ(0)';

    // 生成匹配namespace正则
    function matcherFor( ns ) {
        return new RegExp( '(?:^| )' + ns.replace( ' ', ' .* ?' ) + '(?: |$)' );
    }

    // 分离event name和event namespace
    function parse( name ) {
        var parts = ('' + name).split( '.' );

        return {
            e: parts[ 0 ],
            ns: parts.slice( 1 ).sort().join( ' ' )
        };
    }

    function findHandlers( arr, name, callback, context ) {
        var matcher,
            obj;

        obj = parse( name );
        obj.ns && (matcher = matcherFor( obj.ns ));
        return arr.filter(function( handler ) {
            return handler &&
                (!obj.e || handler.e === obj.e) &&
                (!obj.ns || matcher.test( handler.ns )) &&
                (!callback || handler.cb === callback ||
                    handler.cb._cb === callback) &&
                (!context || handler.ctx === context);
        });
    }

    var Slider = function(options) {
        this.settings = $.extend({}, Slider.defaults, options);
        this._create();
    };

    Slider.prototype ={
        _create: function() {
            var me = this,
                opts = me.settings,
                $el = $(opts.selector.slider);

            me.index = opts.index;

            // 初始dom结构
            me._initDom( $el, opts );

            // 更新width
            me._initWidth( $el, me.index );
            me._container.on(transitionEnd + me.eventNs,
                $.proxy( me._tansitionEnd, me ));

            // 转屏事件检测
            $( window ).on('resize', function() {
                me._initWidth($el, me.index);
            });

            var map = {
                    touchstart: '_onStart',
                    touchmove: '_onMove',
                    touchend: '_onEnd',
                    touchcancel: '_onEnd',
                    click: '_onClick'
                },
                isScrolling,
                start,
                delta,
                moved;

            me._handler = function( e ) {
                me.settings.stopPropagation && e.stopPropagation();
                return map[ e.type ] && me[ map[ e.type ] ].call( me,e);
            };

            $el.on( 'slideend ready', function(){
                if(opts.autoPlay){
                    me.resume();
                }
            });

            var updateDots = function( to, from ) {
                var dotsParent = $el.find( opts.selector.dots );

                if ( !dotsParent.length ) {
                    dotsParent = $('<p></p>').addClass('ui-slider-dots');

                    var dotsLen = $('.ui-slider-item').length;

                    var dotsHtml = '';
                    for(var i=0;i<dotsLen;i++){
                        dotsHtml = dotsHtml + '<b class=""></b>';
                    }

                    dotsParent.html(dotsHtml);

                    dotsParent.appendTo( $el );
                }

                this._dots = dotsParent.children().toArray();

                var dots = this._dots;

                dotsParent.children().removeClass('ui-state-active');

                $.each(dots,function(i,n){
                    if(me.index === i){
                        $(n).addClass('ui-state-active');
                    }
                });
            };

            $el.on( 'slide', function( e, to, from ) {
                if(opts.dots){
                    updateDots.call( me, to, from );
                }
            } );

            $el.on( 'ready', function(){
                // 绑定手势
                $el.on('touchstart', me._handler);

                // 阻止误点击, 犹豫touchmove被preventDefault了，导致长按也会触发click
                me._container.on( 'click', me._handler );

                if(opts.dots){
                    updateDots.call( me, me.index );
                }
            });

            $el.on( 'destroy', function(){
                if(opts.autoPlay){
                    me.stop();
                }
            });
        },

        _onClick: function() {
            return !moved;
        },

        _onStart: function( e ) {
            // 不处理多指
            if ( e.touches.length > 1 ) {
                return false;
            }

            var me = this,
                touche = e.touches[ 0 ],
                opts = me.settings,
                eventNs = me.eventNs,
                $el = $(opts.selector.slider),
                num;

            start = {
                x: touche.pageX,
                y: touche.pageY,
                time: +new Date()
            };

            delta = {};
            moved = false;
            isScrolling = undefined;

            num = opts.viewNum || 1;
            me._move( opts.loop ? me._circle( me.index - num ) :
                me.index - num, -me.width, 0, true );
            me._move( opts.loop ? me._circle( me.index + num ) :
                me.index + num, me.width, 0, true );

            $el.on( 'touchmove',me._handler );

            $el.on( ' touchend', me._handler );

            $el.on( ' touchcancel', me._handler );

            if(opts.autoPlay){
                me.stop();
            }
        },

        _onMove: function( e ) {

            // 多指或缩放不处理
            if ( e.touches.length > 1 || e.scale &&
                e.scale !== 1 ) {
                return false;
            }

            var opts = this.settings,
                viewNum = opts.viewNum || 1,
                touche = e.touches[ 0 ],
                index = this.index,
                i,
                len,
                pos,
                slidePos;

            opts.disableScroll && e.preventDefault();

            delta.x = touche.pageX - start.x;
            delta.y = touche.pageY - start.y;

            if ( typeof isScrolling === 'undefined' ) {
                isScrolling = Math.abs( delta.x ) <
                    Math.abs( delta.y );
            }

            if ( !isScrolling ) {
                e.preventDefault();

                if ( !opts.loop ) {

                    // 如果左边已经到头
                    delta.x /= (!index && delta.x > 0 ||

                        // 如果右边到头
                        index === this._items.length - 1 &&
                        delta.x < 0) ?

                        // 则来一定的减速
                        (Math.abs( delta.x ) / this.width + 1) : 1;
                }

                slidePos = this._slidePos;

                for ( i = index - viewNum, len = index + 2 * viewNum;
                      i < len; i++ ) {

                    pos = opts.loop ? this._circle( i ) : i;
                    this._translate( pos, delta.x + slidePos[ pos ], 0 );
                }

                moved = true;
            }
        },

        _onEnd: function() {
            var $el = $(this.settings.selector.slider);

            // 解除事件
            $el.off( 'touchmove',this._handler );

            $el.off(  'touchend',this._handler );

            $el.off( 'touchcancel',this._handler );

            if ( !moved ) {
                return;
            }

            var me = this,
                opts = me.settings,
                viewNum = opts.viewNum || 1,
                index = me.index,
                slidePos = me._slidePos,
                duration = +new Date() - start.time,
                absDeltaX = Math.abs( delta.x ),

            // 是否滑出边界
                isPastBounds = !opts.loop && (!index && delta.x > 0 ||
                    index === slidePos.length - viewNum && delta.x < 0),

            // -1 向右 1 向左
                dir = delta.x > 0 ? 1 : -1,
                speed,
                diff,
                i,
                len,
                pos;

            if ( duration < 250 ) {

                // 如果滑动速度比较快，偏移量跟根据速度来算
                speed = absDeltaX / duration;
                diff = Math.min( Math.round( speed * viewNum * 1.2 ),
                    viewNum );
            } else {
                diff = Math.round( absDeltaX / (me.perWidth || me.width) );
            }

            if ( diff && !isPastBounds ) {
                me._slide( index, diff, dir, me.width, opts.speed,
                    opts, true );

                // 在以下情况，需要多移动一张
                if ( viewNum > 1 && duration >= 250 &&
                    Math.ceil( absDeltaX / me.perWidth ) !== diff ) {

                    me.index < index ? me._move( me.index - 1, -me.perWidth,
                        opts.speed ) : me._move( me.index + viewNum,
                        me.width, opts.speed );
                }
            } else {

                // 滑回去
                for ( i = index - viewNum, len = index + 2 * viewNum;
                      i < len; i++ ) {

                    pos = opts.loop ? me._circle( i ) : i;
                    me._translate( pos, slidePos[ pos ],
                        opts.speed );
                }

                if(opts.autoPlay) {
                    me._timer = null;
                    me.resume();
                }
            }
        },

        _initDom: function( $el, opts ) {
            var selector = opts.selector,
                viewNum = opts.viewNum || 1,
                items,
                container;

            //检测容器节点是否指定
            container = $el.find( selector.container );

            // 没有指定容器则创建容器
            if ( !container.length ) {
                container = $( '<div></div>' );

                // 如果没有传入content, 则将root的孩子作为可滚动item
                if ( !opts.content ) {

                    // 特殊处理直接用ul初始化slider的case
                    if ( $el.is( 'ul' ) ) {
                        this.$el = container.insertAfter( $el );
                        container = $el;
                        $el = this.$el;
                    } else {
                        container.append( $el.children() );
                    }
                } else {
                    this._createItems( container, opts.content );
                }

                container.appendTo( $el );
            }

            // 检测是否构成循环条件
            if ( (items = container.children()).length < viewNum + 1 ) {
                opts.loop = false;
            }

            // 如果节点少了，需要复制几份
            while ( opts.loop && container.children().length < 3 * viewNum ) {
                container.append( items.clone() );
            }

            this.length = container.children().length;

            this._items = (this._container = container)
                .addClass( 'ui-slider-group' )
                .children()
                .addClass( 'ui-slider-item' )
                .toArray();

            this.trigger( 'done.dom', $el.addClass( 'ui-slider' ), opts );
        },

        // 根据items里面的数据挨个render插入到container中
        _createItems: function( container, items ) {
            var i = 0,
                len = items.length;

            for ( ; i < len; i++ ) {
                container.append( this.tpl2html( 'item', items[ i ] ) );
            }
        },

        _initWidth: function( $el, index, force ) {
            var me = this,
                width;

            // width没有变化不需要重排
            if ( !force && (width = $el.width()) === me.width ) {
                return;
            }

            me.width = width;
            me._arrange( width, index );
            me.height = $el.height();
            me.trigger( 'width.change' );
        },

        // 重排items
        _arrange: function( width, index ) {
            var items = this._items,
                i = 0,
                item,
                len;

            this._slidePos = new Array( items.length );

            for ( len = items.length; i < len; i++ ) {
                item = items[ i ];

                item.style.cssText += 'width:' + width + 'px;' +
                    'left:' + (i * -width) + 'px;';
                item.setAttribute( 'data-index', i );

                this._move( i, i < index ? -width : i > index ? width : 0, 0 );
            }

            this._container.css( 'width', width * len );
        },

        _move: function( index, dist, speed, immediate ) {
            var slidePos = this._slidePos,
                items = this._items;

            if ( slidePos[ index ] === dist || !items[ index ] ) {
                return;
            }

            this._translate( index, dist, speed );
            slidePos[ index ] = dist;    // 记录目标位置

            // 强制一个reflow
            immediate && items[ index ].clientLeft;
        },

        _translate: function( index, dist, speed ) {
            var slide = this._items[ index ],
                style = slide && slide.style;

            if ( !style ) {
                return false;
            }

            style.cssText += cssPrefix + 'transition-duration:' + speed +
                'ms;' + cssPrefix + 'transform: translate(' +
                dist + 'px, 0)' + translateZ + ';';
        },

        _circle: function( index, arr ) {
            var len;

            arr = arr || this._items;
            len = arr.length;

            return (index % len + len) % arr.length;
        },

        _tansitionEnd: function( e ) {
            // ~~用来类型转换，等价于parseInt( str, 10 );
            if ( ~~e.target.getAttribute( 'data-index' ) !== this.index ) {
                return;
            }

            this.trigger( 'slideend', this.index );
        },

        _slide: function( from, diff, dir, width, speed, opts ) {
            var me = this,
                to;

            to = me._circle( from - dir * diff );

            // 如果不是loop模式，以实际位置的方向为准
            if ( !opts.loop ) {
                dir = Math.abs( from - to ) / (from - to);
            }

            // 调整初始位置，如果已经在位置上不会重复处理
            this._move( to, -dir * width, 0, true );

            this._move( from, width * dir, speed );
            this._move( to, 0, speed );

            this.index = to;

            if(opts.dots){
                var dots = $('.ui-slider-dots').children();
                dots.removeClass('ui-state-active');
                $.each(dots,function(i,n){
                    if(i === to){
                        $(n).addClass('ui-state-active');
                    }
                });
            }

            if(opts.autoPlay) {
                me._timer = null;
                me.resume();
            }

            return this.trigger( 'slide', to, from );
        },

        /**
         * 切换到第几个slide
         * @method slideTo
         * @chainable
         * @param {Number} to 目标slide的序号
         * @param {Number} [speed] 切换的速度
         * @return {self} 返回本身
         */
        slideTo: function( to, speed ) {
            if ( this.index === to || this.index === this._circle( to ) ) {
                return this;
            }

            var opts = this.settings,
                index = this.index,
                diff = Math.abs( index - to ),

            // 1向左，-1向右
                dir = diff / (index - to),
                width = this.width;

            speed = speed || opts.speed;

            return this._slide( index, diff, dir, width, speed, opts );
        },

        /**
         * 切换到上一个slide
         * @method prev
         * @chainable
         * @return {self} 返回本身
         */
        prev: function() {
            if ( this.settings.loop || this.index > 0 ) {
                this.slideTo( this.index - 1 );
            }

            return this;
        },

        /**
         * 切换到下一个slide
         * @method next
         * @chainable
         * @return {self} 返回本身
         */
        next: function() {
            if ( this.settings.loop || this.index + 1 < this.length ) {
                this.slideTo( this.index + 1 );
            }

            return this;
        },

        /**
         * 返回当前显示的第几个slide
         * @method getIndex
         * @chainable
         * @return {Number} 当前的silde序号
         */
        getIndex: function() {
            return this.index;
        },

        /**
         * 销毁组件
         * @method destroy
         */
        destroy: function() {
            this._container.off( this.eventNs );
            $( window ).off( 'ortchange' + this.eventNs );
            return this.$super( 'destroy' );
        },

        /**
         * 恢复自动播放。
         * @method resume
         * @chainable
         * @return {self} 返回本身
         * @for Slider
         * @uses Slider.autoplay
         */
        resume: function() {
            var me = this,
                opts = me.settings;

            if ( opts.autoPlay && !me._timer) {
                me._timer = setTimeout( function() {
                    me._timer = null;
                    me.slideTo( me.index + 1 );
                }, opts.interval );
            }
            return me;
        },

        /**
         * 停止自动播放
         * @method stop
         * @chainable
         * @return {self} 返回本身
         * @for Slider
         * @uses Slider.autoplay
         */
        stop: function() {
            var me = this;

            if ( me._timer ) {
                clearTimeout( me._timer );
                me._timer = null;
            }
            return me;
        },

        // 重写trigger
        trigger: function( evt ) {
            var i = -1,
                args,
                events,
                stoped,
                len,
                ev;

            if ( !this._events || !evt ) {
                return this;
            }

            typeof evt === 'string' && (evt = new Event( evt ));

            args = slice.call( arguments, 1 );
            evt.args = args;    // handler中可以直接通过e.args获取trigger数据
            args.unshift( evt );

            events = findHandlers( this._events, evt.type );

            if ( events ) {
                len = events.length;

                while ( ++i < len ) {
                    if ( (stoped = evt.isPropagationStopped()) ||  false ===
                        (ev = events[ i ]).cb.apply( ev.ctx2, args )
                        ) {

                        // 如果return false则相当于stopPropagation()和preventDefault();
                        stoped || (evt.stopPropagation(), evt.preventDefault());
                        break;
                    }
                }
            }

            return this;
        },

        // 公用此zepto实例
        staticCall:function(){
            var proto = $.fn,
                slice = [].slice,

            // 公用此zepto实例
                instance = $();

            instance.length = 1;

            return function( item, fn ) {
                instance[ 0 ] = item;
                return proto[ fn ].apply( instance, slice.call( arguments, 2 ) );
            };
        }
    };

    // 默认配置
    Slider.defaults = {
        /**
         * @property {Boolean} [loop=false] 是否连续滑动
         * @namespace options
         */
        loop: false,

        /**
         * @property {Number} [speed=400] 动画执行速度
         * @namespace options
         */
        speed: 400,

        /**
         * @property {Number} [index=0] 初始位置
         * @namespace options
         */
        index: 0,

        /**
         * @property {Boolean} [dots=true] 是否显示分页点
         * @namespace options
         * @for Slider
         * @uses Slider.dots
         */
        dots: false,

        /**
         * @property {Object} [selector={container:'.ui-slider-group'}] 内部结构选择器定义
         * @namespace options
         */
        selector: {
            // 容器的选择器
            slider: '#slider',
            container: '.ui-slider-group',
            dots: '.ui-slider-dots'
        },

        /**
         * @property {Boolean} [stopPropagation=false] 是否阻止事件冒泡
         * @namespace options
         * @for Slider
         * @uses Slider.touch
         */
        stopPropagation: false,

        /**
         * @property {Boolean} [disableScroll=false] 是否阻止滚动
         * @namespace options
         * @for Slider
         * @uses Slider.touch
         */
        disableScroll: false,

        /**
         * @property {Boolean} [autoPlay=true] 是否开启自动播放
         * @namespace options
         * @for Slider
         * @uses Slider.autoplay
         */
        autoPlay: false,

        /**
         * @property {Number} [interval=4000] 自动播放的间隔时间（毫秒）
         * @namespace options
         * @for Slider
         * @uses Slider.autoplay
         */
        interval: 4000
    };

    var rSlider = function(options) {
        new Slider(options);
    };

    window.rSlider = $.rSlider = $.slider = rSlider;
});