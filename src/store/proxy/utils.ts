import { AdmissionClient as EcloudAdmissionClient, AdmissionEvent as EcloudEvent, Deployment as EcloudDeployment, EcloudEventType } from 'admission-client';
import { AcsClient as EcloudAcsClient } from 'acs-client';

import { Deployment } from '../classes';
export function transformEcloudDeploymentToDeployment(ecloudDeployment: EcloudDeployment) {
    let roles: { [rolId: string]: Deployment.Rol } = {};
    let instances: { [instanceId: string]: Deployment.Rol.Instance };

    for (let rolId in ecloudDeployment.roles) {
        instances = {};
        for (let instanceId in ecloudDeployment.roles[rolId].instances) {
            instances[instanceId] = new Deployment.Rol.Instance(
                ecloudDeployment.roles[rolId].instances[instanceId].cnid,
                ecloudDeployment.roles[rolId].instances[instanceId].publicIp,
                ecloudDeployment.roles[rolId].instances[instanceId].privateIp,
                new Deployment.Rol.Instance.Arrangement(
                    ecloudDeployment.roles[rolId].instances[instanceId].arrangement.mininstances,
                    ecloudDeployment.roles[rolId].instances[instanceId].arrangement.maxinstances,
                    ecloudDeployment.roles[rolId].instances[instanceId].arrangement.cpu,
                    ecloudDeployment.roles[rolId].instances[instanceId].arrangement.memory,
                    ecloudDeployment.roles[rolId].instances[instanceId].arrangement.bandwith,
                    ecloudDeployment.roles[rolId].instances[instanceId].arrangement.failureZones
                ),
                ecloudDeployment.roles[rolId].instances[instanceId].volumes,
                ecloudDeployment.roles[rolId].instances[instanceId].ports
            );
        }

        // TODO: Esto debería de resolverse en una actualización de la api
        roles[rolId] = new Deployment.Rol(
            1, // ecloudDeployment.roles[rolId].configuration.cpu : number
            1, // ecloudDeployment.roles[rolId].configuration.memory : number
            1, // ecloudDeployment.roles[rolId].configuration.ioperf : number
            false, // ecloudDeployment.roles[rolId].configuration.iopsintensive : boolean
            1, // ecloudDeployment.roles[rolId].configuration.bandwidth : number
            1, // ecloudDeployment.roles[rolId].configuration.resilence : number
            instances // : { [instanceId: string]: Deployment.Rol.Instance }
        );
    }


    let resourcesConfig: { [resource: string]: any } = {};
    let parameters: any = {};
    let website: Array<string> = null;

    return new Deployment(
        ecloudDeployment.urn, // name: string
        ecloudDeployment.service, // serviceId: string
        resourcesConfig, // resourcesConfig: { [resource: string]: any }
        parameters, // parameters: any
        roles, // roles: { [rolName: string]: DeploymentRol }
        website, // website: Array<string>
    );
}