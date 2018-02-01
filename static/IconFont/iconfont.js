(function(window){var svgSprite='<svg><symbol id="folder" viewBox="0 0 1025 1024"><path d="M355.328 176 433.952 253.248 454.08 272 480.576 272 960.576 272 960.576 848 64.576 848 64.576 176 352.576 176M384.576 112 64.576 112C29.248 112 0.576 140.64 0.576 176L0.576 848C0.576 883.328 29.248 912 64.576 912L960.576 912C995.936 912 1024.576 883.328 1024.576 848L1024.576 272C1024.576 236.64 995.936 208 960.576 208L480.576 208 384.576 112 384.576 112Z"  ></path></symbol><symbol id="close" viewBox="0 0 1024 1024"><path d="M879.480512 64.020082c-22.23235 0-42.339294 9.080819-56.830333 23.728424l-0.007163-0.007163L511.706311 398.677025 200.77063 87.741343l-0.007163 0.007163c-14.492062-14.647605-34.597983-23.728424-56.830333-23.728424-44.155662 0-79.950913 35.795251-79.950913 79.950913 0 22.23235 9.080819 42.339294 23.728424 56.830333l-0.007163 0.007163 310.935682 310.935682L87.702458 822.680878l0.007163 0.007163c-14.647605 14.492062-23.728424 34.597983-23.728424 56.830333 0 44.155662 35.795251 79.950913 79.950913 79.950913 22.23235 0 42.339294-9.080819 56.830333-23.728424l0.007163 0.007163 310.935682-310.935682 310.935682 310.935682 0.007163-0.007163c14.492062 14.647605 34.597983 23.728424 56.830333 23.728424 44.155662 0 79.950913-35.795251 79.950913-79.950913 0-22.23235-9.080819-42.339294-23.728424-56.830333l0.007163-0.007163L624.77346 511.745197l310.935682-310.935682-0.007163-0.007163c14.647605-14.492062 23.728424-34.597983 23.728424-56.830333C959.431425 99.815333 923.635151 64.020082 879.480512 64.020082z"  ></path></symbol><symbol id="caretright" viewBox="0 0 1024 1024"><path d="M635.31088 512q0 14.848-10.848 25.728l-256 256q-10.848 10.848-25.728 10.848t-25.728-10.848-10.848-25.728l0-512q0-14.848 10.848-25.728t25.728-10.848 25.728 10.848l256 256q10.848 10.848 10.848 25.728z"  ></path></symbol><symbol id="pause" viewBox="0 0 1024 1024"><path d="M126.246575 98.191781c0-54.229918 44.074082-98.191781 98.191781-98.191781 54.229918 0 98.191781 44.003945 98.191781 98.191781v827.616438c0 54.229918-44.074082 98.191781-98.191781 98.191781-54.229918 0-98.191781-44.003945-98.191781-98.191781V98.191781z m575.123288 0c0-54.229918 44.074082-98.191781 98.191781-98.191781 54.229918 0 98.191781 44.003945 98.191781 98.191781v827.616438c0 54.229918-44.074082 98.191781-98.191781 98.191781-54.229918 0-98.191781-44.003945-98.191781-98.191781V98.191781z"  ></path></symbol></svg>';var script=function(){var scripts=document.getElementsByTagName("script");return scripts[scripts.length-1]}();var shouldInjectCss=script.getAttribute("data-injectcss");var ready=function(fn){if(document.addEventListener){if(~["complete","loaded","interactive"].indexOf(document.readyState)){setTimeout(fn,0)}else{var loadFn=function(){document.removeEventListener("DOMContentLoaded",loadFn,false);fn()};document.addEventListener("DOMContentLoaded",loadFn,false)}}else if(document.attachEvent){IEContentLoaded(window,fn)}function IEContentLoaded(w,fn){var d=w.document,done=false,init=function(){if(!done){done=true;fn()}};var polling=function(){try{d.documentElement.doScroll("left")}catch(e){setTimeout(polling,50);return}init()};polling();d.onreadystatechange=function(){if(d.readyState=="complete"){d.onreadystatechange=null;init()}}}};var before=function(el,target){target.parentNode.insertBefore(el,target)};var prepend=function(el,target){if(target.firstChild){before(el,target.firstChild)}else{target.appendChild(el)}};function appendSvg(){var div,svg;div=document.createElement("div");div.innerHTML=svgSprite;svgSprite=null;svg=div.getElementsByTagName("svg")[0];if(svg){svg.setAttribute("aria-hidden","true");svg.style.position="absolute";svg.style.width=0;svg.style.height=0;svg.style.overflow="hidden";prepend(svg,document.body)}}if(shouldInjectCss&&!window.__iconfont__svg__cssinject__){window.__iconfont__svg__cssinject__=true;try{document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>")}catch(e){console&&console.log(e)}}ready(appendSvg)})(window)