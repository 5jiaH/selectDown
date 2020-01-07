/*
 *  下拉框 selectDown
 *  @author 玉衡
 *  @url    https://www.jhui21.com
 * 
 */
import {options_itf, randerDOM_itf} from './javascript/interface';
import {$, is_that, DeepExtend, randerDOM} from './javascript/tools';

class selectDown {

    public demo: any;
    // 父级节点
    private nodes: any;

    // 存放所有下拉节点
    private store: object = {};  
    
    // 默认配置对象
    private options: options_itf = {

        // 根据key值搜索
        keys : 'value',   

        childListClass : '.select-drapdown',
        childCloseClass : '.select-close',
        childInputClass : '.select-input-col',
        loadClass : '.select-load',

        // 需要禁止点击的类名
        disabled : [],
        disableClass : ['select-title'],

        /**
         * 1、获取下拉节点 
         * 2、获取数据data 
         * 3、异步请求
         */
        type : 1,      

        // json配置数据
        data : [],

        // 异步请求方法
        ajax : () => {},
        callback : () => {}
    }

    constructor (node:string, options:object = {}){

        this.nodes = $(node);
        this.options = DeepExtend(this.options, options);

        this.init();
    }

    /**
     * 初始化功能
     */
    private init (): void{
        
        let _index: number = 1;
        let _singlekey: number = 1;
        let _sign: object = {}   // 标记有关联的下拉框
        let _that = this;
        
        _that.otherEvent();

        Array.prototype.forEach.call(_that.nodes, (cur:any) => {

            // 获取下拉项
            let childList = $(_that.options['childListClass'] + ' li', cur);

            // 获取关联标记
            let is_sign: any = cur.getAttribute('data-relation');

            // 给下拉框添加唯一标记
            let sk: string = 'select_' + _singlekey;
            cur.setAttribute('data-key', sk);

            let _data: object = _that.getData(childList);

            
            /* 给下拉框添加分组标记 */

            if(!!is_sign){
                if( _sign.hasOwnProperty(is_sign)){
                    cur.setAttribute('data-sign', _sign[is_sign]);

                    _that.store[_sign[is_sign]][sk] = {
                        disabled : _that.options['disabled'],
                        _a : [],  //  增加的禁用
                        _d : [],  //  删除的禁用
                        del : [],
                        ev : cur,
                        lists : _data,
                        selected : ''
                    }
                }else{
                    _sign[is_sign] = _index;
                    cur.setAttribute('data-sign',_index);

                    _that.store[_index] = {
                        [sk] : {
                            disabled : _that.options['disabled'],
                            _a : [],  //  增加的禁用
                            _d : [],  //  删除的禁用
                            ev : cur,
                            del : [],
                            lists : _data,
                            selected : ''
                        }
                    }

                    _index++;
                }
            }else{
                cur.setAttribute('data-sign', _index);

                _that.store[_index] = {
                    [sk] : {
                        disabled :  _that.options['disabled'],
                        _a : [],  //  增加的禁用
                        _d : [],  //  删除的禁用
                        ev : cur,
                        del : [],
                        lists : _data,
                        selected : ''
                    }
                }

                _index++;
            }

            _singlekey++;

            
            // 如果type=2 则行一次渲染
            if(_that.options['type'] == 2){
                _that.render(cur);

            }else if(_that.options['type'] == 1 && _that.options['disabled'].length){

                Array.prototype.forEach.call(childList, (cur: any, index: number) => {
                    let {value} = cur.dataset;
                    if(_that.options['disabled'].indexOf(value) >= 0){
                        cur.classList.add('disabled');
                    }
                })
                
            }

            /* 给input框添加输入事件 */
           _that.addInputEvent(cur);

            /* 添加点击事件 */
            cur.addEventListener('click', (e: any) => {
                _that.eventClick(e);
                e.stopPropagation();
            }, false)
        })

    }

   
    /**
     *  渲染下拉列表 
     */
    private render (ev: any): void{
       
        const _that = this;

        /**
         * sign 唯一组 
         * key  唯一键
         */
        const {sign, key} = ev.dataset;
        
        // 获取响应的储存数据
        const {disabled, del, lists, _a, _d} = JSON.parse(JSON.stringify(_that.store[sign][key]));
        
        // 获取下拉框下的下拉项
        const _list: any = $(_that.options['childListClass'], ev)[0];
        const _children: any = $('li', _list);
        
        // 记录上一个节点
        let nodeStore: any;   
       
        for(let i = 0; i < lists.length; i++){
            
            let cur:any = lists[i];
            
            // 下拉项的data-value属性 
            let _thatValue: string = cur['value'];
            let _thatTtile: string = cur['title'];

            // 下拉项的class转换成数组
            let _itemClass: Array<string> = cur['class'] ? cur['class'].trim().split(' ') : [];

            // 获取节点没有则创建
            let itemDom: any;

            try{

                let selector: string = `li[data-value="${_thatValue}"]`;

                itemDom = $(selector , _list)[0];
                if(!itemDom) throw "没有找到节点，需要新创建节点";

            }catch(e){ // 新建节点
                
                if(del.indexOf(_thatValue) < 0){

                    let domConfig: randerDOM_itf = {
                        tagname : 'li',
                        attr : [
                            {name : 'data-value', value : _thatValue},
                            {name : 'data-title', value : _thatTtile},
                            {name : 'class', value : _itemClass.join(' ')}
                        ],
                        children : []
                    }

                    cur['child'].forEach((cur: any) => {

                        domConfig.children.push({
                            tagname : 'span',
                            attr : [{name : 'class', value : cur['class']}],
                            children : [{text : cur['text']}]
                        })
                    });
                   
                    itemDom = randerDOM(domConfig);

                    if(!nodeStore){
                        // 将节点插入到第一个
                        if(_children.length){
                            itemDom = _list.insertBefore(itemDom, _list.firstChild);
                        }else{
                            itemDom = _list.appendChild(itemDom);
                        }
                    }else{
                        try{
                            itemDom =  _list.insertBefore(itemDom, nodeStore.nextSibling);
                        }catch{
                            itemDom = _list.appendChild(itemDom);
                        }
                    }
                }
            }

            if(!itemDom) continue;
            

            /**
             * 不能选中的节点
             */
            if(disabled.indexOf(_thatValue) >= 0 || _a.indexOf(_thatValue) >= 0) itemDom.classList.add('disabled');
            
            /**
             * 当前节点上一次选中的值
             */
            if(_d.indexOf(_thatValue) >= 0)  itemDom.classList.remove('disabled')

            nodeStore = itemDom;
        }

        // 删除多余的节点
        _children.forEach((cur: any) => {
            try{
                let _value: string = cur.dataset.value;
                if(del.length && del.indexOf(_value) >= 0){
                    _list.removeChild(cur);
                }
            }catch(e){}
        })

        _that.store[sign][key]['disabled'] =  _that.concatArray(disabled, _a, _d);
        _that.store[sign][key]['del'] = [];
        _that.store[sign][key]['_a'] = [];
        _that.store[sign][key]['_d'] = [];

    }
    

    private json2arr(obj: object, key: number | string): any[]{
        let result: any[] = [];
        
        Array.prototype.forEach.call(obj, (cur: any) => {
            result.push(cur[key] || '')
        })

        return result;
    }

    private concatArray(arr: any[], add: any[], del: any[]): any[]{
        let result: any[] = arr.concat(add);

        del.forEach(cur => {
            let _index = result.indexOf(cur);
            if(_index >= 0){
                result.splice(_index, 1)
            }

        });

        return result;
    }

    /**
     * 两个数组的交集
     */
    private difference(arr1: string[], arr2: string[]): string[]{
        let result: string[] = [];

        arr1.forEach(cur => {
            if(arr2.indexOf(cur) < 0){
                result.push(cur)
            }
        })

        return result;
    }

    /**
     * 点击事件，判断点击位置
     * 
     * @param ev
     */
    private eventClick (ev: any):void {
        let _that: any = this;
        let _target: any = ev.target;
        let _targetType: string = _that.getTarget(_target);
        let _targetList: any = $(_that.options['childListClass'], ev.currentTarget)[0]

        let allLists = $(_that.options['childListClass']);
       
        Array.prototype.forEach.call(allLists, (cur: any) => {
           if(_targetList != cur) cur.style.display = 'none';
        })
       
        switch(_targetType){
            case 'input' :
                _that.eventClickInput(ev)
            break;
            case 'close' :
                _that.eventClickClose(ev)
            break;
            case 'list' :
                _that.eventClickList(ev)
            break;
        }
    }

    /**
     * 
     * @param ev
     */
    private getTarget (ev: any): string{

        let _l: string = this.options['childListClass'].substr(1)
        let _c: string = this.options['childCloseClass'].substr(1)
        let _i: string = this.options['childInputClass'].substr(1)

        if(is_that(ev, _l)){

            return 'list'
        }else if(is_that(ev, _c)){

            return 'close'
        }else if(is_that(ev, _i)){
            
            return 'input'
        }

        return '';

    }


    private eventClickInput (ev: any): void{
        let _parent: any = ev.currentTarget;
        this.eventHideList(_parent);
    }

    /**
     * 清除选中数据
     * @param ev 
     */
    private eventClickClose (ev: any): void{
        let _that = this;
        let _parent: any = ev.currentTarget;

        let _sign: string = _parent.getAttribute('data-sign');
        let _key: string = _parent.getAttribute('data-key');
        
        let _getgroup: object = _that.store[_sign];

        let _input = $(_that.options['childInputClass'], _parent)[0]
        let _value: string = _getgroup[_key].selected;

        for(let i in _getgroup){
            let _groupDisable: Array<string> = _getgroup[i].disabled;
            let _index: number = _groupDisable.indexOf(_value);

            if(!!_value && _index >= 0){
                _that.store[_sign][i]['_d'].push(_value);
            }

            _that.render(_getgroup[i].ev);
        }

        _input.value = '';
        _getgroup[_key].selected = '';
        _that.eventHideList(_parent, false);
    }

    private eventClickList (ev: any): boolean{
        let _parent: any = ev.currentTarget;

        // 点击的下拉项
        let _that: any = is_that(ev.target, 'none', 'li');     

        let _input: any = $(this.options['childInputClass'], _parent)[0]
        let _dataset: any = _that.dataset;

        // 下拉框分组标记
        let _id: string = _parent.dataset.sign;         
        
        // 下拉框唯一标记
        let _key: string = _parent.dataset['key'];    
        
        // 分组数据
        let _store: object = this.store[_id];                                       
        let _prevValue: any = _store[_key].selected
        let _isdisabled: boolean = false;

        // 下拉项类名
        let _thatClass = _that.getAttribute('class') || '';                         
        let _disabledStore: Array<string> = this.options['disableClass'].concat(['disabled']);


        // 判断下拉项能否点击
        if(_thatClass){
            _thatClass.split(' ').forEach((cur: string): boolean => {
                if(_disabledStore.indexOf(cur) >= 0){
                    _isdisabled = true;
                    return false;
                }
            })
        }
        if(_isdisabled) return false;


        for(let i in _store){
            let cur_disabled: Array<number> =  _store[i].disabled;
            let _index: number = cur_disabled.indexOf(_prevValue);
           
            if(i == _key) _store[i].selected = _dataset.value;
            if(_index >= 0) _store[i]['_d'].push(_prevValue);
           
            _store[i]['_a'].push(_dataset.value)

            this.render(_store[i].ev)
        }
        
        _input.value = _dataset.title;

        this.options.callback(_dataset);
        this.eventHideList(_parent, false);

        return false;
       
    }

    /**
     * 输入框变动时出发事件
     * @param down 
     */
    private addInputEvent(down: any){
        let _that = this;
        let _input: any = $(_that.options['childInputClass'], down)[0];

        _input.addEventListener('input', (e: any) => {
            let _t: any = e.target
            let _key: any = _t.value;

            clearTimeout(_t.timer)
            /* 防抖 */
            _t.timer = setTimeout(() => {
                _that.eventInput(down, _key)
            }, 200);

        }, false)
    }

    private getData(childList = []): object{

        let _that = this;
        let _type = _that.options['type'];
        let _data: Array<any> = [];

        /* 判断获取数据方式 */
        if(_type == 2){   // 固定数据
            _data = _that.options.data;

        }else if(_type == 1){

            // 将下拉项转成对象储存
            childList.forEach((cur, index) => {
                let curItem: object = {};
                let children = $('span', cur)

                curItem['value'] = cur.dataset['value']
                curItem['title'] = cur.dataset['title']
                curItem['class'] = cur.getAttribute('class')
                curItem['child'] = []

                if(children.length > 0){
                    children.forEach((t: any, i: number) => {
                        let item: object = {}
                        item['text'] = t.innerHTML
                        item['class'] = t.getAttribute('class')

                        curItem['child'].push(item)
                    })
                }

                _data.push(curItem);
            })
        }

        return _data;
    }

    /**
     * 输入框输入触发事件
     * @param target 父节点
     * @param keys 关键字
     */
    private eventInput (target: any, keys: any): void{
        let _that: any = this;
        let _type: number = _that.options['type'];
        let _key: string = target.dataset.key;
        let _sign: string = target.dataset.sign;

        if(_type == 3){
            if(keys){
                _that.showLoad(target);
                let _t: object = {
                    _that : _that,
                    _ev : target
                }
                _that.options.ajax(keys, _t, _that.ajaxSuccess, _that.ajaxError);
            }else{
                _that.render(target);
            }
        }else{
            let _store: any[] = _that.store[_sign][_key]['lists'];
            let _del: string[] = [];

            if(keys != ''){
                // 需要删除的节点
                _store.forEach(cur => {
                    if(cur.title.indexOf(keys) < 0){
                        _del.push(cur.value)
                    }    
                });
            }
           
            _that.store[_sign][_key]['del'] = _del;
            _that.render(target);
        }

        _that.eventHideList(target)
    }

    
    private ajaxSuccess(res: Array<any>, _t: object){
        let _that: any =  _t['_that'];
        let _key: string = _t['_ev'].dataset.key;
        let _sign: number = _t['_ev'].dataset.sign;

        let ajaxResult: string[] = _that.json2arr(res, 'value');
        let disableResult: string[] = _that.json2arr(_that.store[_sign][_key]['lists'], 'value');

        let _del: string[] = _that.difference(disableResult, ajaxResult)

        _that.store[_sign][_key]['lists'] = res;
        _that.store[_sign][_key]['del'] = _del;
       
        _that.showLoad( _t['_ev']);
        _that.render(_t['_ev']);
        _that.eventHideList(_t['_ev']);

    }

    private ajaxError(_t: object){
        let _that: any =  _t['_that'];
        _that.showLoad(_t['_ev']);

    }

    private otherEvent (): void{
        let _that = this;
        document.documentElement.addEventListener('click', () => {
            let allLists = document.querySelectorAll(_that.options['childListClass']);

            Array.prototype.forEach.call(allLists, cur => {
                cur.style.display = 'none'
            })
        })
    }

    /**
     * 显示隐藏下拉框
     * @param ev 
     * @param hide true: 显示 false：隐藏
     */
    private eventHideList (ev: any, hide = true): void {
        let list: any = $(this.options['childListClass'], ev)[0]
        let item: any = $('li', list);
        if(hide && item.length){
            list.style.display = 'block'
        }else{
            list.style.display = 'none'
        }
    }

    private showLoad (ev: any){
        let load: any = ev.querySelector(this.options['loadClass']);
        if(load.style.display == 'none' || load.style.display == ''){
            load.style.display = 'block'
        }else{
            load.style.display = 'none'
        }
    }
}


import './style/selectDown.scss';
export = selectDown;