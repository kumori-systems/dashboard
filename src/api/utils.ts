import {
  ECloudElement, EntryPoint, Resource
} from '../store/stampstate/classes';

/**
 * Given an URN returns the ECloud element type
 * @param urn <string> URN which represents the element in the stamp.
 */
export function getElementType(urn: string): ECloudElement.ECLOUDELEMENT_TYPE {

  if (urn.startsWith('http://eslap.cloud/manifest/service/'))
    return ECloudElement.ECLOUDELEMENT_TYPE.SERVICE;
  if (urn.startsWith('http://eslap.cloud/manifest/runtime/'))
    return ECloudElement.ECLOUDELEMENT_TYPE.RUNTIME;
  if (
    urn.startsWith('http://eslap.cloud/manifest/component/')
    || urn.startsWith('slap://slapdomain/manifests/component/')
  )
    return ECloudElement.ECLOUDELEMENT_TYPE.COMPONENT;
  if (urn.startsWith('eslap://eslap.cloud/resource/'))
    return ECloudElement.ECLOUDELEMENT_TYPE.RESOURCE;

  let res: ECloudElement.ECLOUDELEMENT_TYPE = null;

  let splitted = urn.split('/');

  let i = 3;

  // If this is a temporary element, the type will be twice realocated to
  // the left
  if (splitted[2] === 'temporary') { i = i + 2; }

  switch (splitted[i]) {
    case 'runtime':
    case 'runtimes':
      res = ECloudElement.ECLOUDELEMENT_TYPE.RUNTIME;
      break;
    case 'service':
    case 'services':
      res = ECloudElement.ECLOUDELEMENT_TYPE.SERVICE;
      break;
    case 'component':
    case 'components':
      res = ECloudElement.ECLOUDELEMENT_TYPE.COMPONENT;
      break;
    case 'resource':
    case 'resources':
      res = ECloudElement.ECLOUDELEMENT_TYPE.RESOURCE;
      break;
    default:
      console.error('Unknown element type ' + splitted[i] + ' of ' + urn);
  }

  return res;
}

/**
 * Given a URN of an element returns the resource type of the element.
 * @param urn <string> 
 */
export function getResourceType(urn: string): Resource.RESOURCE_TYPE {

  if (urn.startsWith('eslap://eslap.cloud/resource/vhost/'))
    return Resource.RESOURCE_TYPE.DOMAIN;
  if (urn.startsWith('slap//eslap.cloud/resource/cert/server/'))
    return Resource.RESOURCE_TYPE.CERTIFICATE;
  if (urn.startsWith('eslap://eslap.cloud/resource/volume/persistent/'))
    return Resource.RESOURCE_TYPE.PERSISTENT_VOLUME;
  if (urn.startsWith('eslap://eslap.cloud/resource/volume/volatile/'))
    return Resource.RESOURCE_TYPE.VOLATILE_VOLUME;

  let res: Resource.RESOURCE_TYPE = null;
  try {

    let splitted = urn.split('/');
    let i = 4;
    if (splitted[2] === 'temporary') { i = i + 2; }

    // Obtain the type. In case it's a temporary element, the type will be twice
    // realocated to the left
    switch (splitted[i]) {
      case 'volume':
      case 'volumes':
        res = Resource.RESOURCE_TYPE.PERSISTENT_VOLUME;
        break;
      case 'cert':
        res = Resource.RESOURCE_TYPE.CERTIFICATE;
        break;
      case 'vhost':
        res = Resource.RESOURCE_TYPE.DOMAIN;
        break;
      default:

        // This part is supposed to be a temporary solution.
        switch (splitted[i + 1]) {
          case 'volume':
          case 'volumes':
            res = Resource.RESOURCE_TYPE.PERSISTENT_VOLUME;
            break;
          case 'cert':
            res = Resource.RESOURCE_TYPE.CERTIFICATE;
            break;
          case 'vhost':
            res = Resource.RESOURCE_TYPE.DOMAIN;
            break;
          default:
            console.error('Not able to extract resource from \'' + urn + '\'.');
        }
    }

  } catch (err) {
    console.error('Unrecognized URN format \'' + urn + '\'. Error: ' + err);
  }

  return res;

}

/**
 * Given the URN of an element returns it's domain.
 * @param urn <string> URN with the format
 *  'eslap://<domain>/deployment/<name>/<version>'.
 */
export function getElementDomain(urn: string): string {

  let res: string = null;

  try {
    res = urn.split('/')[2];
  } catch (err) {
    console.error('Unrecognized URN format \'' + urn + '\'. Error: ' + err);
  }

  return res;

}

/**
 * Given the URN of an element returns it's name.
 * @param urn <string> URN with the format
 *  'eslap://<domain>/deployment/<name>/<version>'.
 */
export function getElementName(urn: string): string {

  let res: string = null;
  try {
    res = urn.split('/')[2];

    let splitted: Array<string> = urn.split('/');
    res = splitted[4];
    for (let i = 5; i < splitted.length - 1; i++) {
      res += '.' + splitted[i];
    }

  } catch (err) {
    console.error('Unrecognized URN format \'' + urn + '\'. Error: ' + err);
  }
  return res;

}

/**
 * Given the URN of an element returns it's version.
 * @param urn <string> URN with the format
 *  'eslap://<domain>/deployment/<name>/<version>'.
 */
export function getElementVersion(urn: string): string {

  let res: string = null;
  try {

    let splitted: Array<string> = urn.split('/');
    res = splitted[splitted.length - 1];

  } catch (err) {
    console.error('Unrecognized URN format \'' + urn + '\'. Error: ' + err);
  }
  return res;

}

/**
 * Given an URN of an element returns if the 
 * @param urn <string> URN with the format
 *  'eslap://<domain>/deployment/<name>/<version>'.
 */
export function isServiceEntrypoint(urn: string): boolean {

  let res: boolean = false;
  switch (urn) {
    case EntryPoint.ENTRYPOINT_TYPE.HTTP_INBOUND:
      res = true;
    default:
    // Do nothing because res is already false
  }
  return res;

}