# component-slider
组件名称：图片滑动<br>
组件功能：支持图片无缝播放，支持自动播放，支持分页点和title显示或隐藏<br>
组件参数：

$.slider({

            /**
             * @property {Boolean} [loop=false] 是否连续滑动
             */
            loop: true,

            /**
             * @property {Number} [speed=400] 动画执行速度
             */
            speed: 400,

            /**
             * @property {Number} [index=0] 初始位置
             */
            index: 0,

            /**
             * @property {Boolean} [dots=true] 是否显示分页点
             */
            dots: true,

            /**
             * @property {Object} [selector={container:'.ui-slider-group'}] 内部结构选择器定义
             */
            selector: {
                // 容器的选择器
                slider: '#slider',
                container: '.ui-slider-group',
                dots: '.ui-slider-dots'
            },

            /**
             * @property {Boolean} [stopPropagation=false] 是否阻止事件冒泡
             */
            stopPropagation: false,

            /**
             * @property {Boolean} [disableScroll=false] 是否阻止滚动
             */
            disableScroll: false,

            /**
             * @property {Boolean} [autoPlay=true] 是否开启自动播放
             */
            autoPlay: true,

            /**
             * @property {Number} [interval=4000] 自动播放的间隔时间（毫秒）
             */
            interval: 4000
        });
