export namespace backend {
	
	export class AppInfo {
	    name: string;
	    version: string;
	    schema_version: string;
	
	    static createFrom(source: any = {}) {
	        return new AppInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.version = source["version"];
	        this.schema_version = source["schema_version"];
	    }
	}
	export class EnvVar {
	    key: string;
	    default: string;
	    description: string;
	    secret: boolean;
	    required: boolean;
	
	    static createFrom(source: any = {}) {
	        return new EnvVar(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.default = source["default"];
	        this.description = source["description"];
	        this.secret = source["secret"];
	        this.required = source["required"];
	    }
	}
	export class Port {
	    container_port: number;
	    host_port: number;
	    label: string;
	
	    static createFrom(source: any = {}) {
	        return new Port(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.container_port = source["container_port"];
	        this.host_port = source["host_port"];
	        this.label = source["label"];
	    }
	}
	export class Service {
	    name: string;
	    category: string;
	    description: string;
	    versions: string[];
	    logo?: string;
	    image: string;
	    ports: Port[];
	    env?: EnvVar[];
	    volume_name?: string;
	    volume_path?: string;
	    command?: string[];
	
	    static createFrom(source: any = {}) {
	        return new Service(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.category = source["category"];
	        this.description = source["description"];
	        this.versions = source["versions"];
	        this.logo = source["logo"];
	        this.image = source["image"];
	        this.ports = this.convertValues(source["ports"], Port);
	        this.env = this.convertValues(source["env"], EnvVar);
	        this.volume_name = source["volume_name"];
	        this.volume_path = source["volume_path"];
	        this.command = source["command"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class StartServiceRequest {
	    name: string;
	    image: string;
	    version: string;
	    port_mapping: Record<string, any>;
	    env_mapping?: Record<string, string>;
	    volume_name?: string;
	    volume_path?: string;
	    command?: string[];
	
	    static createFrom(source: any = {}) {
	        return new StartServiceRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.image = source["image"];
	        this.version = source["version"];
	        this.port_mapping = source["port_mapping"];
	        this.env_mapping = source["env_mapping"];
	        this.volume_name = source["volume_name"];
	        this.volume_path = source["volume_path"];
	        this.command = source["command"];
	    }
	}

}

export namespace docker {
	
	export class PortSpec {
	    Label: string;
	    HostPort: number;
	    ContainerPort: number;
	
	    static createFrom(source: any = {}) {
	        return new PortSpec(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Label = source["Label"];
	        this.HostPort = source["HostPort"];
	        this.ContainerPort = source["ContainerPort"];
	    }
	}
	export class Container {
	    id: string;
	    name: string;
	    service_name: string;
	    version: string;
	    image: string;
	    state: string;
	    ports: PortSpec[];
	    created_at: string;
	
	    static createFrom(source: any = {}) {
	        return new Container(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.service_name = source["service_name"];
	        this.version = source["version"];
	        this.image = source["image"];
	        this.state = source["state"];
	        this.ports = this.convertValues(source["ports"], PortSpec);
	        this.created_at = source["created_at"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DockerStatus {
	    available: boolean;
	    version: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new DockerStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.available = source["available"];
	        this.version = source["version"];
	        this.error = source["error"];
	    }
	}

}

export namespace network {
	
	export class PortCheckResponse {
	    port: number;
	    available: boolean;
	    message?: string;
	
	    static createFrom(source: any = {}) {
	        return new PortCheckResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.port = source["port"];
	        this.available = source["available"];
	        this.message = source["message"];
	    }
	}

}

