import React, { useState } from 'react';
import { Sports, large } from './data';

import {
  AutoComplete,
  ComboBox,
  DropDownList,
  MultiSelect,
} from '@progress/kendo-react-dropdowns';
import { filterBy } from '@progress/kendo-data-query';

export default function Kendo() {
  const [data, setData] = useState(large);
  const [value, setValue] = useState('');

  const filterData = (value) => {
    const _data = large;
    const filter = {
      value,
      field: 'text',
      operator: 'startswith',
      ignoreCase: true,
    };
    return value ? filterBy(_data, filter) : _data;
  };

  const onChange = (event) => {
    const value = event.target.value;

    setData(filterData(value));
    setValue(value);
  };

  const filterChange = (event) => {
    setData(filterBy(large.slice(), event.filter));
  };

  const itemRender = (li, itemProps) => {
    const index = itemProps.index;
    const itemChildren = (
      <span style={{ color: '#00F' }}>
        {li.props.children} - ID: {itemProps.dataItem.id}
      </span>
    );

    return React.cloneElement(li, li.props, itemChildren);
  };

  return (
    <div>
      <div className="example-wrapper" style={{ minHeight: '400px' }}>
        <div className="col-xs-12 col-sm-7 example-col">
          <p>MultiSelect</p>
          <MultiSelect
            data={data}
            textField="text"
            filterable={true}
            onFilterChange={filterChange}
            itemRender={itemRender}
          />
        </div>
        <div className="col-xs-12 col-sm-7 example-col">
          <p>AutoComplete</p>
          <AutoComplete
            data={data}
            value={value}
            textField="text"
            onChange={onChange}
          />
        </div>
        <div className="col-xs-12 col-sm-7 example-col">
          <p>ComboBox</p>
          <ComboBox data={Sports} defaultValue="Basketball" />
        </div>
        <div className="col-xs-12 col-sm-7 example-col">
          <p>DropDownList</p>
          <DropDownList data={Sports} defaultValue="Basketball" />
        </div>
      </div>
    </div>
  );
}
