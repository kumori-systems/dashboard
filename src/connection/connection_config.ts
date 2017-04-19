let defaultBasePath: string;
switch (process.env.NODE_ENV) {
    case 'production':
        defaultBasePath = 'http://admission-stability.osdmz.iti.es/admission';
        break;
    case 'development':
    default:
        defaultBasePath = 'localhost:8090';
}

export { defaultBasePath }