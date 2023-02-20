class DoublyLinkedListNode {
    y(x, y, arg2, arg3) {
        throw new Error("Method not implemented.");
    }
    x(x, y, arg2, arg3) {
        throw new Error("Method not implemented.");
    }
    constructor(data) {
        this._data = data;
        this._prev = null;
        this._next = null;
    }
    get data() {
        return this._data;
    }
    set data(data) {
        this._data = data;
    }
    get next() {
        return this._next;
    }
    set next(node) {
        this._next = node;
    }
    get prev() {
        return this._prev;
    }
    set prev(node) {
        this._prev = node;
    }
}
class DoublyLinkedListIterator {
    constructor(startNode) {
        this.current = startNode;
    }
    next() {
        if (this.current) {
            const value = this.current;
            this.current = this.current.next;
            return { done: false, value };
        }
        else {
            return { done: true, value: null };
        }
    }
}
class DoublyLinkedListReverseIterator {
    constructor(node) {
        this.current = node;
    }
    next() {
        if (this.current === null) {
            return { done: true, value: null };
        }
        const value = this.current;
        this.current = this.current.prev;
        return { done: false, value: value };
    }
    [Symbol.iterator]() {
        return this;
    }
}
export default class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }
    getSize() {
        return this.size;
    }
    isEmpty() {
        return this.size === 0;
    }
    [Symbol.iterator]() {
        return new DoublyLinkedListIterator(this.head);
    }
    find(data) {
        let tempNode = new DoublyLinkedListNode(data);
        for (const node of this) {
            if (node.data === data) {
                tempNode = node;
            }
        }
        return tempNode;
    }
    swapNodes(index1, index2) {
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
        }
        else {
            this.head = node2;
        }
        if (prev2) {
            prev2.next = node1;
        }
        else {
            this.head = node1;
        }
        if (next1) {
            next1.prev = node2;
        }
        else {
            this.tail = node2;
        }
        if (next2) {
            next2.prev = node1;
        }
        else {
            this.tail = node1;
        }
        [node1.prev, node2.prev, node1.next, node2.next] = [node2.prev, node1.prev, node2.next, node1.next];
        return true;
    }
    getNodesWithValue(data) {
        const nodesList = new DoublyLinkedList();
        for (const node of this) {
            if (node.data === data) {
                nodesList.addLast(node.data);
            }
        }
        return nodesList;
    }
    addFirst(data) {
        const newNode = new DoublyLinkedListNode(data);
        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        }
        else {
            newNode.next = this.head;
            this.head.prev = newNode;
            this.head = newNode;
        }
        ++this.size;
        return true;
    }
    addLast(data) {
        const newNode = new DoublyLinkedListNode(data);
        if (this.isEmpty()) {
            this.head = newNode;
            this.tail = newNode;
        }
        else {
            newNode.prev = this.tail;
            this.tail.next = newNode;
            this.tail = newNode;
        }
        ++this.size;
        return true;
    }
    removeFirst() {
        if (this.isEmpty()) {
            return null;
        }
        const removedNode = this.head;
        if (this.getSize() === 1) {
            this.head = null;
            this.tail = null;
        }
        else {
            this.head = this.head.next;
            this.head.prev = null;
            removedNode.next = null;
        }
        --this.size;
        return removedNode.data;
    }
    removeLast() {
        if (this.isEmpty()) {
            return null;
        }
        const removedNode = this.tail;
        if (this.getSize() === 1) {
            this.head = null;
            this.tail = null;
        }
        else {
            this.tail = this.tail.prev;
            this.tail.next = null;
            removedNode.prev = null;
        }
        --this.size;
        return removedNode.data;
    }
    insertAt(index, data) {
        if (index < 0 || index > this.size) {
            return false;
        }
        if (index === 0) {
            return this.addFirst(data);
        }
        if (index === this.size) {
            return this.addLast(data);
        }
        const node = new DoublyLinkedListNode(data);
        const current = this.getNodeAt(index);
        const prev = current.prev;
        node.prev = prev;
        node.next = current;
        current.prev = node;
        prev.next = node;
        ++this.size;
        return true;
    }
    removeAt(index) {
        if (index < 0 || index >= this.size) {
            return null;
        }
        let current = this.getNodeAt(index);
        const prev = current.prev;
        const next = current.next;
        if (current === this.head) {
            this.head = next;
        }
        else {
            prev.next = next;
            current.prev = null;
        }
        if (current === this.tail) {
            this.tail = prev;
        }
        else {
            next.prev = prev;
            current.next = null;
        }
        --this.size;
        return current.data;
    }
    indexOf(data) {
        let index = 0;
        for (const node of this) {
            if (node.data === data) {
                return index;
            }
            ++index;
        }
        return -1;
    }
    contains(data) {
        return this.indexOf(data) !== -1;
    }
    toArray() {
        const result = [];
        let current = this.head;
        for (const node of this) {
            result.push(node.data);
        }
        return result;
    }
    remove(data) {
        let current = this.head;
        while (current !== null) {
            if (current.data === data) {
                if (current === this.head) {
                    this.head = current.next;
                    if (this.head) {
                        this.head.prev = null;
                    }
                    else {
                        this.tail = null;
                    }
                }
                else if (current === this.tail) {
                    this.tail = current.prev;
                    if (this.tail) {
                        this.tail.next = null;
                    }
                    else {
                        this.head = null;
                    }
                }
                else {
                    current.prev.next = current.next;
                    current.next.prev = current.prev;
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
    getFirstNode() {
        return this.head;
    }
    getLastNode() {
        return this.tail;
    }
    getNodeAt(index) {
        if (index < 0 || index >= this.size) {
            return null;
        }
        let current;
        if (index <= this.size / 2) {
            current = this.head;
            for (let i = 0; i < index; i++) {
                current = current.next;
            }
        }
        else {
            current = this.tail;
            for (let i = this.size - 1; i > index; i--) {
                current = current.prev;
            }
        }
        return current;
    }
    reverse() {
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
    shuffle() {
        const arr = [];
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
        const newList = new DoublyLinkedList();
        arr.forEach((data) => {
            newList.addLast(data);
        });
        this.head = newList.head;
        this.tail = newList.tail;
        this.size = newList.size;
    }
    forEach(callback) {
        let index = 0;
        for (const node of this) {
            callback(node.data, index);
            index++;
        }
    }
    forEachReverse(callback) {
        let index = this.size - 1;
        const reverseIterator = new DoublyLinkedListReverseIterator(this.tail);
        for (const node of reverseIterator) {
            callback(node.data, index);
            index--;
        }
    }
    clear() {
        for (const node of this) {
            node.prev = null;
            node.next = null;
        }
        this.head = null;
        this.tail = null;
        this.size = 0;
    }
    filter(predicate) {
        const newList = new DoublyLinkedList();
        this.forEach((value, index) => {
            if (predicate(value, index)) {
                newList.addLast(value);
            }
        });
        return newList;
    }
}
