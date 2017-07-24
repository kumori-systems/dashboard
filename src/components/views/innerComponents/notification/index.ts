import Notification from './notification';
export { Notification };

export enum notificationType {
    NORMAL = '',
    PRIMARY = 'primary',
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    DANGER = 'danger'
}

export enum notificationDirection {
    DOWN = 'Down',
    RIGHT = 'Right',
    LEFT = 'Left',
    UP = 'Up'
}

export function createNotification(title: string, message?: string, type?: notificationType, direction?: notificationDirection, duration?: number) {

    let data = {
        title: '',
        message: '',
        type: '',
        direction: '',
        duration: 4500,
        container: '.notifications'
    };
    data['title'] = title;
    if (type) data['type'] = type;
    if (message) data['message'] = message;

    return new Notification({
        el: document.createElement('div'),
        data
    });

}