import { AcsClient } from 'acs-client';
import { AdmissionClient, AdmissionEvent, Deployment } from 'admission-client';
import { all, Promise } from 'q';
let admission: AdmissionClient;
let acs: AcsClient;
const userid = 'josep';
const username: string = userid + '@iti.es';
const password = userid;
let deployments: number = 0;
import { createReadStream, ReadStream } from 'fs';
let registries: number = 0;

console.log('Ejecutamos PRUEBA');
const ADMISSION_URI: string = 'http://admission.argo.kumori.cloud/admission';
admission = new AdmissionClient(ADMISSION_URI);
admission.onConnected(() => {
    console.log('===========================CONNECT***************');
});
admission.onEcloudEvent((event: AdmissionEvent) => {
    console.log('===========================DATA***************');
    console.log(JSON.stringify(event, null, 2));
});
admission.onError((reason: any) => {
    console.log('===========================ERROR***************');
    console.log(reason);
});
admission.init().then(() => {

    /*
    admission.findStorage().then((value) => {
        console.log('findStorage nos devuelve: ', value);
    });
    */
    admission.findDeployments().then((value) => {
        console.log('DEPLOYMENTS: ', value);
    });

    // Pedimos info de un servicio
    admission.getStorageManifest('eslap://temporary/b7354586240e46a8912ba402f341f428/echo_basic.examples.ecloud/services/echo_tester/1_0_2').then((value) => {
        console.log('SERVICIO findStorage nos devuelve: ', value);
    });

    // Pedimos info de un runtime
    admission.getStorageManifest('eslap://linagora.c2netproject.eu/runtime/ucp/1_0_0/kk').then((value) => {
        console.log('RUNTIME findStorage nos devuelve: ', value);
    });

    // Pedimos info de un webdomain
    admission.getStorageManifest('eslap://sampleservicecalculator/resources/vhost/www_mesie_com').then((value) => {
        console.log('WEBDOMAIN findStorage nos devuelve: ', value);
    });

    // Pedimos info de un componente
    admission.getStorageManifest('eslap://linagora.c2netproject.eu/components/mpe_md/1_1_7').then((value) => {
        console.log('COMPONENTE findStorage nos devuelve: ', value);
    });

    // Pedimos info de un certificado
    admission.getStorageManifest('eslap://sampleservicecalculator/resources/cert/server/calccert').then((value) => {
        console.log('CERTIFICADO findStorage nos devuelve: ', value);
    });
});
