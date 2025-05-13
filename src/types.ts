// default operators *may* need to be different for two columns of the same type?
// Would prefer consistency of a default operator per column type if possible.
export interface Column {
  id: string;
  label: string;
  type: string;
  defaultOperatorId: string;
  picklistOptions?: Value[]; // for picklist columns
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