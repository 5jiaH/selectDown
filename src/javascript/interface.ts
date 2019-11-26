export interface Event_itf{
    name:string;
    fun(event: any): void;
}

export interface options_itf {
    keys : string;
    childListClass : string;
    childCloseClass : string;
    childInputClass : string;
    loadClass : string;
    disableClass : Array<string>;
    disabled : Array<string>;
    type : number;
    data : Array<any>;
    ajax (): void;
    callback (value: object): void;
}

export interface randerDOM_itf{
    tagname : string;
    attr? : Array<object>;
    children? : Array<any>;
    text? : string;
    event? : Array<any>;
};


export interface Attribute_itf{
    name:string;
    value: string|number|boolean;
}
