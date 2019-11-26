import { randerDOM_itf, Attribute_itf } from './interface';


export const getDataType = (obj: any): string => Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();

export const $ = (nodename: string, parent = document): any => {
    return parent.querySelectorAll(nodename);
}

/**
 * 判断是否当前、获取当前的祖先节点
 * @param ev
 * @param classname： 用于判断是否当前  @return boolean
 * @param tagname： 用于获取祖先节点 标签.类名 / 标签、 当前只能获取类名
 */
export const is_that = (ev: any, classname: string, tagname: string = ''): boolean | object => {

    if (!(ev instanceof HTMLElement)) return false;

    let cn: string = ev.getAttribute('class') || '';
    let classlist: Array<string> = cn ? cn.trim().split(/\s+/) : [];


    if (!!tagname) {
        let filterArray: Array<string> = tagname.split('.')
        let tagn: string = filterArray[0];
        let tagClass: string = filterArray[1] || '';

        if (ev.tagName.toLowerCase() == tagn) {
            if (tagClass) {
                if (classlist.length && classlist.indexOf(tagClass) >= 0) return ev;
            } else {
                return ev;
            }
        }
    }

    if (classlist.indexOf(classname) >= 0) {
        return true;
    } else {
        return is_that(ev.parentNode, classname, tagname);
    }

};


/**
 * 深度合并
 * @param obj1 
 * @param obj2 
 */
export const DeepExtend = (obj1: any,obj2: any): any => {

    if(getDataType(obj1) === 'object' && getDataType(obj2) === 'object'){
        for( let prop2 in obj2){ //obj1无值,都有取obj2

            if(!obj1[prop2]){
                obj1[prop2] = obj2[prop2];
            }else{ //递归赋值
                obj1[prop2] = DeepExtend(obj1[prop2],obj2[prop2]);
            }
        }
    }else if(getDataType(obj1) === 'array' && getDataType(obj2) === 'array'){
        // 两个都是数组，进行合并
        obj1 = obj1.concat(obj2);

    }else{ //其他情况，取obj2的值
        obj1 = obj2;
    }

    return obj1;
}


export const randerDOM = (config: randerDOM_itf, append = null): any => {

    let dom: any;

    if (config.hasOwnProperty('text') && config.text) {
        dom = document.createTextNode(config.text);
    } else {
        dom = document.createElement(config.tagname);

        Object.keys(config).forEach((cur, index) => {
            switch (cur) {
                case 'attr':
                    config[cur].forEach((attr: Attribute_itf) => {
                        dom.setAttribute(attr.name, attr.value);
                    });
                    break;
                case 'children':
                    config[cur].forEach(child => {
                        randerDOM(child, dom);
                    })
                    break;
                case 'event':
                    config[cur].forEach(_event => {
                        dom.addEventListener(_event.name, event => {
                            _event.fun(event);
                        }, false)
                    });
                    break;
            }
        });
    }

    !!append ? append.appendChild(dom) : null;
    return dom;
}

