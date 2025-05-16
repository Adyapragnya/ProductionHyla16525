// components/SearchableSelect.js
import PropTypes from "prop-types";
import Select from "react-select";

export default function SearchableSelect({ options, value, onChange, placeholder, getOptionLabel }) {
    const formattedOptions = options.map((opt) => ({
      value: opt._id,
      label: getOptionLabel ? getOptionLabel(opt) : opt.name,
    }));

    const customStyles = {
      control: (base) => ({
        ...base,
        minHeight: '36px',
        height: '36px',
        fontSize: '14px',
        borderRadius: '4px',
        borderColor: '#ccc',
      }),
      valueContainer: (base) => ({
        ...base,
        padding: '0 8px',
      }),
      indicatorsContainer: (base) => ({
        ...base,
        height: '36px',
      }),
      input: (base) => ({
        ...base,
        margin: 0,
        padding: 0,
      }),
      
      
      option: (base, state) => ({
        ...base,
        padding: '6px 10px',
        fontSize: '13px',
        backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
        color: 'black',
      }),
      menu: (base) => ({
        ...base,
        zIndex: 1000,
      }),
      menuList: (base) => ({
        ...base,
        maxHeight: '300px',  // or 400px
        overflowY: 'auto',
        paddingTop: 0,
        paddingBottom: 0,
      }),
      menuPortal: (base) => ({
        ...base,
        zIndex: 10000, // Must be higher than modal
      }),
    };
    
    
  
    return (
      <Select
      styles={customStyles}
      options={formattedOptions}
      value={formattedOptions.find((opt) => opt.value === value) || null}
      onChange={(selected) => onChange(selected?.value || "")}
      placeholder={placeholder}
      isClearable
      menuPortalTarget={document.body}
      menuPosition="fixed"
      menuShouldScrollIntoView={false}
    />
    
    );
  }
  
  SearchableSelect.propTypes = {
    options: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string,
      })
    ).isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    getOptionLabel: PropTypes.func, // optional
  };
  