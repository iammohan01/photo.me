export type Process = () => any;
export type Subscriber = (task: Process) => void;

class Observer {
    private subscribers: Array<Subscriber> = [];

    create = (task: Process) => {
        this.publish(task);
    };

    private publish = (task: Process) => {
        this.subscribers.forEach((subscriber) => subscriber(task));
    };
    subscribe = (subscriber: Subscriber) => {
        this.subscribers.push(subscriber);
        return () => {
            const index = this.subscribers.indexOf(subscriber as any);
            this.subscribers.splice(index, 1);
        };
    };
}

const ProcesserState = new Observer();
const publishProcess = ProcesserState.create;

export { ProcesserState };
export default publishProcess;
