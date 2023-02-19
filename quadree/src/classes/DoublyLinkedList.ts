class DoublyLinkedListNode<T> {
    y(x: (x: any, y: any, arg2: number, arg3: number) => void, y: any, arg2: number, arg3: number) {
        throw new Error("Method not implemented.");
    }
    x(x: any, y: any, arg2: number, arg3: number) {
        throw new Error("Method not implemented.");
    }
    private _data: T;
    private _prev: DoublyLinkedListNode<T> | null;
    private _next: DoublyLinkedListNode<T> | null;

    constructor(data: T) {
        this._data = data;
        this._prev = null;
        this._next = null;
    }

    get data(): T {
        return this._data;
    }

    set data(data: T) {
        this._data = data;
    }

    get next(): DoublyLinkedListNode<T> | null {
        return this._next;
    }

    set next(node: DoublyLinkedListNode<T> | null) {
        this._next = node;
    }

    get prev(): DoublyLinkedListNode<T> | null {
        return this._prev;
    }

    set prev(node: DoublyLinkedListNode<T> | null) {
        this._prev = node;
    }

}

class DoublyLinkedListIterator<T> implements Iterator<DoublyLinkedListNode<T>> {
    private current: DoublyLinkedListNode<T> | null;

    constructor(startNode: DoublyLinkedListNode<T> | null) {
        this.current = startNode;
    }

    public next(): IteratorResult<DoublyLinkedListNode<T>> {
        if (this.current) {
            const value = this.current;
            this.current = this.current.next;
            return { done: false, value };
        } else {
            return { done: true, value: null };
        }
    }
}

class DoublyLinkedListReverseIterator<T> implements IterableIterator<DoublyLinkedListNode<T>> {
  private current: DoublyLinkedListNode<T> | null;

  constructor(node: DoublyLinkedListNode<T>) {
    this.current = node;
  }

  public next(): IteratorResult<DoublyLinkedListNode<T>> {
    if (this.current === null) {
      return { done: true, value: null };
    }

    const value = this.current;
    this.current = this.current.prev;

    return { done: false, value: value };
  }

  [Symbol.iterator](): IterableIterator<DoublyLinkedListNode<T>> {
    return this;
  }
}

interface ObjectWithToString {
    toString(): string;
}
export default class DoublyLinkedList<T> {
    private head: DoublyLinkedListNode<T> | null;
    private tail: DoublyLinkedListNode<T> | null;
    private size: number;

    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    public getSize(): number {
        return this.size;
    }

    public isEmpty(): boolean {
        return this.size === 0;
    }

    public [Symbol.iterator](): Iterator<DoublyLinkedListNode<T>> {
        return new DoublyLinkedListIterator<T>(this.head);
    }

    public find(data: T): DoublyLinkedListNode<T>{
        let tempNode = new DoublyLinkedListNode<T>(data);
        for (const node of this) {
            if (node.data === data) {
                tempNode = node;
            }
        }
        return tempNode;
    }

    public swapNodes(index1: number, index2: number): boolean {
        if (index1 < 0 || index1 >= this.size || index2 < 0 || index2 >= this.size || index1 === index2) {
            return false;
        }
    
        // Ensure that index1 <= index2
        if (index1 > index2) {
            [index1, index2] = [index2, index1];
        }
    
        const node1 = this.getNodeAt(index1);
        const node2 = this.getNodeAt(index2);
    
        if (!node1 || !node2) {
            return false;
        }
    
        const prev1 = node1.prev;
        const prev2 = node2.prev;
        const next1 = node1.next;
        const next2 = node2.next;
    
        if (prev1) {
            prev1.next = node2;
        } else {
            this.head = node2;
        }
    
        if (prev2) {
            prev2.next = node1;
        } else {
            this.head = node1;
        }
    
        if (next1) {
            next1.prev = node2;
        } else {
            this.tail = node2;
        }
    
        if (next2) {
            next2.prev = node1;
        } else {
            this.tail = node1;
        }
    
        [node1.prev, node2.prev, node1.next, node2.next] = [node2.prev, node1.prev, node2.next, node1.next];
    
        return true;
    }
    

    public getNodesWithValue(data: T): DoublyLinkedList<T> {
        const nodesList: DoublyLinkedList<T> = new DoublyLinkedList<T>();
        for (const node of this) {
            if (node.data === data) {
                nodesList.addLast(node.data);
            }
        }
        return nodesList;
    }

   
    public addFirst(data: T): boolean {
        const newNode = new DoublyLinkedListNode<T>(data);

        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.next = this.head;
            this.head!.prev = newNode;
            this.head = newNode;
        }
        ++this.size;
        return true;
    }

    public addLast(data: T): boolean {
        const newNode = new DoublyLinkedListNode<T>(data);

        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            newNode.prev = this.tail;
            this.tail!.next = newNode;
            this.tail = newNode;
        }
        ++this.size;
        return true;
    }

    public removeFirst(): T | null {
        if (this.isEmpty()) {
            return null;
        }
        const removedNode = this.head;
        if (this.getSize() === 1) {
            this.head = null;
            this.tail = null;
        } else {
            this.head = this.head!.next;
            this.head!.prev = null;
            removedNode!.next = null;
        }
        --this.size;
        return removedNode!.data;
    }

    public removeLast(): T | null {
        if (this.isEmpty()) {
            return null;
        }
        const removedNode = this.tail;
        if (this.getSize() === 1) {
            this.head = null;
            this.tail = null;
        } else {
            this.tail = this.tail!.prev;
            this.tail!.next = null;
            removedNode!.prev = null;
        }
        --this.size;
        return removedNode!.data;
    }

    public insertAt(index: number, data: T): boolean {
        if (index < 0 || index > this.size) {
            return false
        }

        if (index === 0) {
            return this.addFirst(data)
        }

        if (index === this.size) {
            return this.addLast(data)
        }

        const node = new DoublyLinkedListNode<T>(data)
        const current = this.getNodeAt(index)
        const prev = current!.prev

        node.prev = prev
        node.next = current
        current!.prev = node
        prev!.next = node
        ++this.size

        return true
    }

    public removeAt(index: number): T | null {
        if (index < 0 || index >= this.size) {
            return null
        }

        let current = this.getNodeAt(index)
        const prev = current!.prev
        const next = current!.next

        if (current === this.head) {
            this.head = next
        } else {
            prev!.next = next
            current!.prev = null
        }

        if (current === this.tail) {
            this.tail = prev
        } else {
            next!.prev = prev
            current!.next = null
        }

        --this.size
        return current!.data
    }

    public indexOf(data: T): number {
        let index = 0;

        for (const node of this) {
            if (node.data === data) {
                return index;
            }
            ++index;
        }
        return -1;
    }

    public contains(data: T): boolean {
        return this.indexOf(data) !== -1;
    }

    public toArray(): T[] {
        const result: T[] = [];

        let current = this.head;
        for (const node of this) {
            result.push(node.data);
        }
        return result;
    }

    public remove(data: T): boolean {
        let current = this.head;
        while (current !== null) {
            if (current.data === data) {
                if (current === this.head) {
                    this.head = current.next;
                    if (this.head) {
                        this.head.prev = null;
                    } else {
                        this.tail = null;
                    }
                } else if (current === this.tail) {
                    this.tail = current.prev;
                    if (this.tail) {
                        this.tail.next = null;
                    } else {
                        this.head = null;
                    }
                } else {
                    current.prev!.next = current.next;
                    current.next!.prev = current.prev;
                }
                current.prev = null;
                current.next = null;
                this.size--;
                return true;
            }
            current = current.next;
        }
        return false;
    }
    
    
    

    public getFirstNode(): DoublyLinkedListNode<T> | null {
        return this.head;
    }

    public getLastNode(): DoublyLinkedListNode<T> | null {
        return this.tail;
    }

    public getNodeAt(index: number): DoublyLinkedListNode<T> | null {
        if (index < 0 || index >= this.size) {
            return null;
        }
        let current: DoublyLinkedListNode<T> | null;
        if (index <= this.size / 2) {
            current = this.head;
            for (let i = 0; i < index; i++) {
                current = current!.next;
            }
        } else {
            current = this.tail;
            for (let i = this.size - 1; i > index; i--) {
                current = current!.prev;
            }
        }
        return current;
    }

    public reverse(): void {
        if (this.size <= 1) {
            return;
        }

        let current = this.head;
        this.head = this.tail;
        this.tail = current;

        while (current) {
            const next = current.next;
            current.next = current.prev;
            current.prev = next;
            current = next;
        }
    }

    public shuffle(): void {
        const arr: T[] = [];

        // Initialize an array of indices from 0 to size - 1
        for (const node of this) {
            arr.push(node.data);
        }

        // Shuffle the indices using the Fisher-Yates shuffle algorithm
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }

        // Clear the linked list and add the nodes back in the shuffled order
        const newList = new DoublyLinkedList<T>();
        arr.forEach((data) => {
            newList.addLast(data);
        });
        this.head = newList.head;
        this.tail = newList.tail;
        this.size = newList.size;

    }

    public forEach(callback: (data: T, index: number) => void): void {
        let index = 0;
        for (const node of this) {
            callback(node.data, index);
            index++;
        }
    }


    public forEachReverse(callback: (data: T, index: number) => void): void {
        let index = this.size - 1;
        const reverseIterator = new DoublyLinkedListReverseIterator(this.tail!);
        for (const node of reverseIterator) {
            callback(node.data, index);
            index--;
        }
    }


    public clear(): void {
        for (const node of this) {
            node.prev = null;
            node.next = null;
        }
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    public filter(predicate: (value: T, index: number) => boolean): DoublyLinkedList<T> {
        const newList = new DoublyLinkedList<T>()

        this.forEach((value, index) => {
            if (predicate(value, index)) {
                newList.addLast(value)
            }
        })
        return newList
    }

    // public toString(): string {
    //     let current = this.head;
    //     let str = "";
    //     while (current) {
    //         if (typeof current.data === "object" && current.data !== null && !("toString" in current.data)) {
    //             str += `[${typeof current.data}] `;
    //         } else {
    //             str += `${current === this.head ? "head" : ""}${current === this.tail ? "tail" : ""}`;
    //             str += `(${current.data}) `;
    //         }
    //         current = current.next;
    //     }
    //     return str;
    // }

    // public print(): void {
    //     let current = this.head;
    //     let result = "";
    //     while (current) {
    //         result += current === this.head ? `head(${current.data.toString()})` : current === this.tail ? `tail(${current.data.toString()})` : current.data.toString();
    //         result += current.next ? " <=> " : "";
    //         current = current.next;
    //     }
    //     if (result === "") {
    //         result = "empty";
    //     }
    //     console.log(result);
    // }
}
