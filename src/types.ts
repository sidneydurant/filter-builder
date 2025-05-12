export interface Column {
  id: string;
  label: string;
  type: string;
  // TODO values: Value[] | Promise<Value[]>;
}

export interface Operator {
  id: string;
  label: string;
  aliases: string[];
}

export interface Value {
  id: string;
  label: string;
}

export interface FilterPill {
  type: 'filter';
  value: string;
  // Store components for easier manipulation
  components: {
    column: string;
    operator: string;
    value: string;
  };
}