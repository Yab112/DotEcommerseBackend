export interface SwaggerContact {
  name: string;
  email: string;
  url: string;
}

export interface SwaggerLicense {
  name: string;
  url: string;
}

export interface SwaggerInfo {
  title: string;
  version: string;
  description: string;
  contact: SwaggerContact;
  license: SwaggerLicense;
}

export interface SwaggerServer {
  url: string;
  description: string;
}

export interface SwaggerSecurityScheme {
  type: string;
  scheme: string;
  bearerFormat: string;
  description: string;
}

export interface SwaggerComponents {
  securitySchemes: {
    bearerAuth: SwaggerSecurityScheme;
  };
  schemas: {
    User: Record<string, unknown>;
    Error: Record<string, unknown>;
  };
}
