class NodeDoubleLinkedList<T>{
    value: T | null;
    prev: NodeDoubleLinkedList<T> | null;
    next: NodeDoubleLinkedList<T> | null;

  constructor(value: T){
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class DoubleLinkList<T> {
  length: number;
  last: NodeDoubleLinkedList<T> | null;
  first: NodeDoubleLinkedList<T> | null;

  constructor(){
    this.length = 0;
    this.last = null;
    this.first = null;
  }

  push(value : T){
    const newNode = new NodeDoubleLinkedList(value);
    this.length++;
    if (this.length === 1){
      this.last = newNode;
      this.first = newNode;
      return;
    }
    if (this.last) this.last.next = newNode;
    newNode.prev = this.last;
    this.last = newNode;
  }

  getIthFromEnd(i : number){
    if (i < 0 || !this.last || i >= this.length) return null;
    if (i === 0) return this.last.value;

    let index = 0;
    let currentNode = this.last;
    while (index < i) {
        if (!currentNode.prev) return;
        currentNode = currentNode.prev;
        index++;
        }
    return currentNode.value; 
  }

  removeFirst(){
    if (this.length <= 0) return;
    this.length--;
    if (this.length === 0){
      this.last = null;
      this.first = null;
      return;
    }
    if (this.first) this.first = this.first.next;
    if (this.first) this.first.prev = null;
  }

  printList(){
    console.log(this.stringifyList());
  }

  stringifyList(){
    let currentNode = this.first;
    let result = '';
    while(currentNode){
      result += currentNode.value;
      currentNode = currentNode.next;
      if (currentNode) result += ' -> ';
    }
    return result;
  }
}

export class InputListWithLimit{

  list : DoubleLinkList<string>;
  limit: number;
  length: number;
  currentNode: NodeDoubleLinkedList<string> | null;
  localStorageKey: string;

  private saveTimeout = setTimeout(() => {}, 0);
  readonly timeoutMiliseconds: number = 10000;

  constructor(limit : number, localStorageKey : string){
    this.list = new DoubleLinkList<string>();
    this.limit = limit > 0? limit : 0;
    this.length = 0;
    this.currentNode = null;
    this.localStorageKey = localStorageKey;
    this.initialLode();
  }

  private initialLode(){
    const loaded = localStorage.getItem(this.localStorageKey);
    if (!loaded) return;
    const newList = new DoubleLinkList<string>();
    loaded.split('->').forEach(node =>  newList.push(node.slice(0, -1).slice(1)));
    this.list = newList;
  }

  push(value : string){
    if (this.list.length >= this.limit) this.list.removeFirst();
    this.list.push(value);
    this.length = this.list.length;
    this.reset();
    this.enqueueSaving();
    return;
 
  }

  getIthFromEnd(i : number){ return this.list.getIthFromEnd(i);}

  reset(){
    this.currentNode = null;
  }

  moveCurrentBack(){
    if (!this.currentNode){
        this.currentNode = this.list.last;
        return;
    }
    if (!this.currentNode.prev) return;
    this.currentNode = this.currentNode.prev;
  }

  moveCurrentForward(){
    if (!this.currentNode) return;
    if (this.currentNode.next) this.currentNode = this.currentNode.next;
    else this.currentNode = this.list.last;
  }

  getCurrent(){
    return this.currentNode?.value;
  }
  
  printList(){this.list.printList();}

  saveHistory(){
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.list.stringifyList()));
  }

  enqueueSaving(){
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveHistory();
    }, this.timeoutMiliseconds);
  }
}