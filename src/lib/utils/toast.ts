import { Toaster, toast as _toast, type ToastOptions } from 'svelte-sonner';
export { Toaster };

const parse_message_for_toast = (message: string | object) => {
    if (typeof message === 'string') {
        return message;
    } else {
        return JSON.stringify(message);
    }
};

export const toast = {
    error: (message: string | unknown, options?: ToastOptions) => {
        if (typeof message === 'string') {
            _toast.error(message, options);
        } else if (message instanceof Error) {
            // _toast.error(message.name + message.message + message?.stack + message?.cause, options);
            _toast.error(`${message.name} (${message.message})\n${message?.stack}`, options);
        } else {
            _toast.error(JSON.stringify(message), options);
        }
    },
    success: (message: string, options?: ToastOptions) => _toast.success(parse_message_for_toast(message), options),
    info: (message: string, options?: ToastOptions) => _toast.info(parse_message_for_toast(message), options),
    warning: (message: string, options?: ToastOptions) => _toast.warning(parse_message_for_toast(message), options),
    message: (message: string, options?: ToastOptions) => _toast.message(parse_message_for_toast(message), options),
    loading: (message: string, options?: ToastOptions) => _toast.loading(parse_message_for_toast(message), options),
    custom: (component: any, options?: ToastOptions) => _toast.custom(component, options),
    promise: (promise: Promise<any>, options?: ToastOptions) => _toast.promise(promise, options),
    dismiss: (id: string | number) => _toast.dismiss(id),
};
