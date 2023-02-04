import React, { useState, useEffect } from "react";
interface Data {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Props {
  index: number | null;
  data: Data;
  onSave: (index: number, newData: Data) => void;
  onClose: () => void;
}

interface Proppos {
  dataPerPage: number;
  totalData: number;
  currentPage: number;
  handlePageChange: (pageNumber: number) => void;
}

const Pagination= ({ dataPerPage, totalData, currentPage, handlePageChange } : Proppos) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalData / dataPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className="pagination">
        {pageNumbers.map(number => (
          <li key={number} className={currentPage === number ? 'active' : ''} style={{margin: "auto"}}>
            <a onClick={() => handlePageChange(number)} href="#">
              {number} 
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const EditModal = ({ index, data, onSave, onClose }: Props) => {
  const [formData, setFormData] = useState({ ...data });

  const onFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const onSubmit = () => {
    onSave(index as number, formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Data</h2>
          <i
            className="fa fa-close"
            onClick={onClose}
            style={{ cursor: "pointer" }}
          />
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onFormChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onFormChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={onFormChange}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const [data, setData] = useState<Data[]>([
  ]);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataPerPage, setDataPerPage] = useState(5);
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("");
  const [mastercheck, setMastercheck] = useState(false);
  const indexOfLastData = currentPage * dataPerPage;
  const indexOfFirstData = indexOfLastData - dataPerPage;
  const currentData = data.slice(indexOfFirstData, indexOfLastData).map(row => ({
    ...row,
    isChecked: mastercheck
  }));
  let [currenSelected, setCurentSlected ] = useState([""]);
  const [selectedIndex, setSelectedIndex] = useState<
    { id: number; name: string; email: string; role: string; isChecked: boolean }[]
  >(currentData);

  const onEdit = (index: number) => {
    setEditIndex(index);
  };

  const onSave = (index: number, newData: Data) => {
    setData((prevData) =>
      prevData.map((data, i) => {
        if (i === index) {
          return newData;
        }
        return data;
      })
    );
    setEditIndex(null);
  };

  const onClose = () => {
    setEditIndex(null);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  const onDelete = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setSearch(event.target.value);
  };
  const onMasterCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setMastercheck(event.target.checked);
    setSelectedIndex(selectedIndex.map(artwork => {
      artwork.isChecked = event.target.checked;
        return artwork;
    }))
  };
const onItemCheck = (
  event: React.ChangeEvent<HTMLInputElement>,
  id: number
) => {
  // mastercheck && setMastercheck(!mastercheck);
  const nextList = selectedIndex.length ? [...selectedIndex] : [...currentData];
  const findArray = nextList.find(a => a.id == id);
  findArray && (findArray.isChecked = event.target.checked);
  // console.log(findArray, nextList);
  setSelectedIndex(nextList);

};
const handleClick = () =>{
  let filter = selectedIndex.filter(a => a.isChecked !== true);
  let check = [...currenSelected];
  filter.forEach(a => check.push(a.id.toString()))
 setCurentSlected(check);
 setSelectedIndex(filter)
}
useEffect(() => {
  fetch(
    `https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json`
  )
    .then((response) => response.json())
    .then((actualData) =>{
      setData([...actualData]);
      setLoading(false);
    })
    .catch((err) => {
      setLoading(true);
      console.log(err.message);
    });
    setSelectedIndex(currentData);
    console.log(currenSelected)
}, []);

return ( 
  <>
  {loading && currentData.length ?( <div>...loading</div>): (
  <div className="App">
  <input
    type="search"
    placeholder="Enter Name or email"
    onChange={(e) => handleChange(e)}
  />
  <table className="table">
    <thead>
      <tr>
        <th scope="col">
          <input
            type="checkbox"
            className="form-check-input"
            checked={mastercheck}
            id="mastercheck"
            onChange={(e) => onMasterCheck(e)}
          />
        </th>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {(currenSelected.length >1 ? selectedIndex : currentData).filter((el)=> el.name.toLowerCase().includes(search)).map((data, index) => (
        <tr key={index}>
          <th scope="row">
            <input
              type="checkbox"
              // eslint-disable-next-line eqeqeq
              checked={selectedIndex.some(a => a.id == data.id) ? selectedIndex[index].isChecked : false}
              className="form-check-input"
              id="rowcheck{user.id}"
              onChange={(e) => onItemCheck(e, data.id)}
            />
          </th>
          <td>{data.name}</td>
          <td>{data.email}</td>
          <td>{data.role}</td>
          <td>
            <img
              src="https://www.pngfind.com/pngs/m/275-2755033_edit-png-file-on-phone-svg-edit-icon.png"
              style={{ marginLeft: "20px" }}
              alt="edit"
              width="20"
              height="20"
              onClick={() => onEdit(index)}
            />
            <img
              src="https://www.freeiconspng.com/uploads/blue-delete-button-png-29.png"
              style={{ marginLeft: "20px" }}
              alt="delete"
              width="20"
              height="20"
              onClick={() => onDelete(index)}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  <Pagination
        dataPerPage={dataPerPage}
        totalData={data.length}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
      />
      <button style={{padding: "10px", color: "wheat", backgroundColor: 'red'}} onClick={handleClick}>Delete Selected</button>
  {editIndex !== null && (
    <EditModal
            index={editIndex}
            data={data[editIndex]}
            onSave={onSave}
            onClose={onClose} />
  )}
</div>

)}
</>
);
};
export default Admin;




