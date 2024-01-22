import React from 'react';

const FileSelectButton = ({ returnFile, name, label, disabled,
                            accepts =  '.csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
}) => {
  const handleFileChange = event => {
    console.log(`handleFileChange ${event.target.files}`);
    returnFile(event.target.files[0]);
  }

  return (
        <div className='flex justify-s items-center'>
            <input
                name={name}
                role='file-input'
                type='file'
                accept={accepts}
                onChange={handleFileChange}
                disabled={disabled}
                multiple={false}
                className='py-2 px-3 cursor-pointer bg-bl-text-light text-bl-text-grey'
            />
          <p className='py-2 px-3 justify-start'>
            {label}
          </p>
        </div>
    );
};

export default FileSelectButton;
