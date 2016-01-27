define(function(){function t(t){return new RegExp("(?:^| )"+t.replace(" "," .* ?")+"(?: |$)")}function e(t){var e=(""+t).split(".");return{e:e[0],ns:e.slice(1).sort().join(" ")}}function i(i,n,s,r){var o,a;return a=e(n),a.ns&&(o=t(a.ns)),i.filter(function(t){return!(!t||a.e&&t.e!==a.e||a.ns&&!o.test(t.ns)||s&&t.cb!==s&&t.cb._cb!==s||r&&t.ctx!==r)})}var n=$.fx.cssPrefix,s=$.fx.transitionEnd,r=" translateZ(0)",o=function(t){this.settings=$.extend({},o.defaults,t),this._create()};o.prototype={_create:function(){var t=this,e=t.settings,i=$(e.selector.slider);t.index=e.index,t._initDom(i,e),t._initWidth(i,t.index),t._container.on(s+t.eventNs,$.proxy(t._tansitionEnd,t)),$(window).on("resize",function(){t._initWidth(i,t.index)});var n={touchstart:"_onStart",touchmove:"_onMove",touchend:"_onEnd",touchcancel:"_onEnd",click:"_onClick"};t._handler=function(e){return t.settings.stopPropagation&&e.stopPropagation(),n[e.type]&&t[n[e.type]].call(t,e)},i.on("slideend ready",function(){e.autoPlay&&t.resume()});var r=function(){var n=i.find(e.selector.dots);if(!n.length){n=$("<p></p>").addClass("ui-slider-dots");for(var s=$(".ui-slider-item").length,r="",o=0;s>o;o++)r+='<b class=""></b>';n.html(r),n.appendTo(i)}this._dots=n.children().toArray();var a=this._dots;n.children().removeClass("ui-state-active"),$.each(a,function(e,i){t.index===e&&$(i).addClass("ui-state-active")})};i.on("slide",function(i,n,s){e.dots&&r.call(t,n,s)}),i.on("ready",function(){i.on("touchstart",t._handler),t._container.on("click",t._handler),e.dots&&r.call(t,t.index)}),i.on("destroy",function(){e.autoPlay&&t.stop()})},_onClick:function(){return!moved},_onStart:function(t){if(t.touches.length>1)return!1;var e,i=this,n=t.touches[0],s=i.settings,r=(i.eventNs,$(s.selector.slider));start={x:n.pageX,y:n.pageY,time:+new Date},delta={},moved=!1,isScrolling=void 0,e=s.viewNum||1,i._move(s.loop?i._circle(i.index-e):i.index-e,-i.width,0,!0),i._move(s.loop?i._circle(i.index+e):i.index+e,i.width,0,!0),r.on("touchmove",i._handler),r.on(" touchend",i._handler),r.on(" touchcancel",i._handler),s.autoPlay&&i.stop()},_onMove:function(t){if(t.touches.length>1||t.scale&&1!==t.scale)return!1;var e,i,n,s,r=this.settings,o=r.viewNum||1,a=t.touches[0],l=this.index;if(r.disableScroll&&t.preventDefault(),delta.x=a.pageX-start.x,delta.y=a.pageY-start.y,"undefined"==typeof isScrolling&&(isScrolling=Math.abs(delta.x)<Math.abs(delta.y)),!isScrolling){for(t.preventDefault(),r.loop||(delta.x/=!l&&delta.x>0||l===this._items.length-1&&delta.x<0?Math.abs(delta.x)/this.width+1:1),s=this._slidePos,e=l-o,i=l+2*o;i>e;e++)n=r.loop?this._circle(e):e,this._translate(n,delta.x+s[n],0);moved=!0}},_onEnd:function(){var t=$(this.settings.selector.slider);if(t.off("touchmove",this._handler),t.off("touchend",this._handler),t.off("touchcancel",this._handler),moved){var e,i,n,s,r,o=this,a=o.settings,l=a.viewNum||1,d=o.index,h=o._slidePos,c=+new Date-start.time,u=Math.abs(delta.x),f=!a.loop&&(!d&&delta.x>0||d===h.length-l&&delta.x<0),_=delta.x>0?1:-1;if(250>c?(e=u/c,i=Math.min(Math.round(e*l*1.2),l)):i=Math.round(u/(o.perWidth||o.width)),i&&!f)o._slide(d,i,_,o.width,a.speed,a,!0),l>1&&c>=250&&Math.ceil(u/o.perWidth)!==i&&(o.index<d?o._move(o.index-1,-o.perWidth,a.speed):o._move(o.index+l,o.width,a.speed));else{for(n=d-l,s=d+2*l;s>n;n++)r=a.loop?o._circle(n):n,o._translate(r,h[r],a.speed);a.autoPlay&&(o._timer=null,o.resume())}}},_initDom:function(t,e){var i,n,s=e.selector,r=e.viewNum||1;for(n=t.find(s.container),n.length||(n=$("<div></div>"),e.content?this._createItems(n,e.content):t.is("ul")?(this.$el=n.insertAfter(t),n=t,t=this.$el):n.append(t.children()),n.appendTo(t)),(i=n.children()).length<r+1&&(e.loop=!1);e.loop&&n.children().length<3*r;)n.append(i.clone());this.length=n.children().length,this._items=(this._container=n).addClass("ui-slider-group").children().addClass("ui-slider-item").toArray(),this.trigger("done.dom",t.addClass("ui-slider"),e)},_createItems:function(t,e){for(var i=0,n=e.length;n>i;i++)t.append(this.tpl2html("item",e[i]))},_initWidth:function(t,e,i){var n,s=this;(i||(n=t.width())!==s.width)&&(s.width=n,s._arrange(n,e),s.height=t.height(),s.trigger("width.change"))},_arrange:function(t,e){var i,n,s=this._items,r=0;for(this._slidePos=new Array(s.length),n=s.length;n>r;r++)i=s[r],i.style.cssText+="width:"+t+"px;left:"+r*-t+"px;",i.setAttribute("data-index",r),this._move(r,e>r?-t:r>e?t:0,0);this._container.css("width",t*n)},_move:function(t,e,i,n){var s=this._slidePos,r=this._items;s[t]!==e&&r[t]&&(this._translate(t,e,i),s[t]=e,n&&r[t].clientLeft)},_translate:function(t,e,i){var s=this._items[t],o=s&&s.style;return o?void(o.cssText+=n+"transition-duration:"+i+"ms;"+n+"transform: translate("+e+"px, 0)"+r+";"):!1},_circle:function(t,e){var i;return e=e||this._items,i=e.length,(t%i+i)%e.length},_tansitionEnd:function(t){~~t.target.getAttribute("data-index")===this.index&&this.trigger("slideend",this.index)},_slide:function(t,e,i,n,s,r){var o,a=this;if(o=a._circle(t-i*e),r.loop||(i=Math.abs(t-o)/(t-o)),this._move(o,-i*n,0,!0),this._move(t,n*i,s),this._move(o,0,s),this.index=o,r.dots){var l=$(".ui-slider-dots").children();l.removeClass("ui-state-active"),$.each(l,function(t,e){t===o&&$(e).addClass("ui-state-active")})}return r.autoPlay&&(a._timer=null,a.resume()),this.trigger("slide",o,t)},slideTo:function(t,e){if(this.index===t||this.index===this._circle(t))return this;var i=this.settings,n=this.index,s=Math.abs(n-t),r=s/(n-t),o=this.width;return e=e||i.speed,this._slide(n,s,r,o,e,i)},prev:function(){return(this.settings.loop||this.index>0)&&this.slideTo(this.index-1),this},next:function(){return(this.settings.loop||this.index+1<this.length)&&this.slideTo(this.index+1),this},getIndex:function(){return this.index},destroy:function(){return this._container.off(this.eventNs),$(window).off("ortchange"+this.eventNs),this.$super("destroy")},resume:function(){var t=this,e=t.settings;return e.autoPlay&&!t._timer&&(t._timer=setTimeout(function(){t._timer=null,t.slideTo(t.index+1)},e.interval)),t},stop:function(){var t=this;return t._timer&&(clearTimeout(t._timer),t._timer=null),t},trigger:function(t){var e,n,s,r,o,a=-1;if(!this._events||!t)return this;if("string"==typeof t&&(t=new Event(t)),e=slice.call(arguments,1),t.args=e,e.unshift(t),n=i(this._events,t.type))for(r=n.length;++a<r;)if((s=t.isPropagationStopped())||!1===(o=n[a]).cb.apply(o.ctx2,e)){s||(t.stopPropagation(),t.preventDefault());break}return this},staticCall:function(){var t=$.fn,e=[].slice,i=$();return i.length=1,function(n,s){return i[0]=n,t[s].apply(i,e.call(arguments,2))}}},o.defaults={loop:!1,speed:400,index:0,dots:!1,selector:{slider:"#slider",container:".ui-slider-group",dots:".ui-slider-dots"},stopPropagation:!1,disableScroll:!1,autoPlay:!1,interval:4e3};var a=function(t){new o(t)};window.rSlider=$.rSlider=$.slider=a});