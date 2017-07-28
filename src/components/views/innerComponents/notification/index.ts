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

export function createNotification(title: string);
export function createNotification(title: string, message: string);
export function createNotification(title: string, message: string, type: notificationType);
export function createNotification(title: string, message?: string, type?: notificationType, direction?: notificationDirection, duration?: number) {
    return new Notification({
        el: document.createElement('div'),
        props: {
            'title': {
                'type': String,
                'required': false,
                'default': title
            },
            'message': {
                'type': String,
                'required': false,
                'default': message
            },
            'type': {
                'type': String,
                'required': false,
                'default': type
            },
            'direction': {
                'type': String,
                'required': false,
                'default': direction
            },
            'duration': {
                'type': Number,
                'required': false,
                'default': 4500
            },
            'container': {
                'type': String,
                'required': false,
                'default': '.notifications'
            }
        }
    });
}