import { useEffect, useState } from 'react';
import { Button, EditableText, InputGroup, Toaster } from '@blueprintjs/core';
import './App.css';

const AppToaster = Toaster.create({
    position: "top"
})

// "homepage": "https://karthikgit47.github.io/react-http-crud",

function App() {
    const [users, setUsers] = useState([]);
    const [newName, setNewName] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [newWebsite, setNewWebsite] = useState("")


    useEffect(() => {
        fetch("https://dvmtcreaapi.bexatm.com/api/Dropdown/GetAllSkills", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30"
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("API error");
                }
                return response.json();
            })
            .then((data) => {
                setUsers(data.Data); // or setSkills(data)
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }, []);


    // useEffect(() => {
    //     fetch('https://jsonplaceholder.typicode.com/users')
    //     .then((response) => response.json() )
    //     .then((json) => setUsers(json))
    // },[])

    function addUser() {
        const name = newName.trim();
        const email = newEmail.trim();
        const website = newWebsite.trim();

        if (name && email && website) {
            fetch("https://jsonplaceholder.typicode.com/users",
                {
                    method: "POST",
                    body: JSON.stringify({
                        name,
                        email,
                        website
                    }),
                    headers: {
                        "Content-Type": "application/json; charset=UTF-8 "
                    }
                }
            ).then((response) => response.json())
                .then(data => {
                    setUsers([...users, data]);
                    AppToaster.show({
                        message: "user added successfully",
                        intent: 'success',
                        timeout: 3000
                    })
                    setNewName("");
                    setNewEmail("");
                    setNewWebsite("");

                })
        }

    }

    function onChangeHandler(id, key, value) {
        setUsers((users) => {
            return users.map(user => {
                return user.id === id ? { ...user, [key]: value } : user;
            })
        })
    }

    function updateUser(id) {
        const user = users.find((user) => user.id === id);
        fetch(`https://jsonplaceholder.typicode.com/users/10`,
            {
                method: "PUT",
                body: JSON.stringify(user),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8 "
                }
            }
        )
            .then(response => response.json())
            .then(data => {
                AppToaster.show({
                    message: "user updated successfully",
                    intent: 'success',
                    timeout: 3000
                })

            })

    }

    function deleteUser(id) {
        fetch(`https://jsonplaceholder.typicode.com/users/${id}`,
            {
                method: "DELETE",
            })
            .then(response => response.json())
            .then(data => {
                setUsers((users) => {
                    return users.filter(user => user.id !== id)
                })

                AppToaster.show({
                    message: "user deleted successfully",
                    intent: 'success',
                    timeout: 3000
                })

            })
    }

    return (
        // <div className="App">
        //     <table className='bp4-html-table modifier'>
        //         <thead>
        //             <th>ID</th>
        //             <th>Name</th>
        //             <th>Email</th>
        //             <th>Website</th>
        //             <th>Action</th>
        //         </thead>
        //         <tbody>
        //             {users.map(user =>
        //                 <tr key={user.id}>
        //                     <td>{user.id}</td>
        //                     <td>{user.name}</td>
        //                     <td><EditableText onChange={value => onChangeHandler(user.id, 'email', value)} value={user.email} /></td>
        //                     <td><EditableText onChange={value => onChangeHandler(user.id, 'website', value)} value={user.website} /></td>
        //                     <td>
        //                         <Button intent='primary' onClick={() => updateUser(user.id)}>Update</Button>
        //                         &nbsp;
        //                         <Button intent='danger' onClick={() => deleteUser(user.id)} >Delete</Button>
        //                     </td>
        //                 </tr>
        //             )}
        //         </tbody>
        //         <tfoot>
        //             <tr>
        //                 <td></td>
        //                 <td>
        //                     <InputGroup
        //                         value={newName}
        //                         onChange={(e) => setNewName(e.target.value)}
        //                         placeholder='Enter Name...'
        //                     />
        //                 </td>
        //                 <td>
        //                     <InputGroup
        //                         value={newEmail}
        //                         onChange={(e) => setNewEmail(e.target.value)}
        //                         placeholder='Enter Email...'
        //                     />
        //                 </td>
        //                 <td>
        //                     <InputGroup
        //                         value={newWebsite}
        //                         onChange={(e) => setNewWebsite(e.target.value)}
        //                         placeholder='Enter Website...'
        //                     />
        //                 </td>
        //                 <td>
        //                     <Button intent='success' onClick={addUser}>Add User</Button>
        //                 </td>
        //             </tr>
        //         </tfoot>
        //     </table>
        // </div>

        <div className="App table-wrapper">
            <table className="bp4-html-table bp4-html-table-striped custom-table">
                <thead>
                    <tr>
                        <th>Record ID</th>
                        <th>Skill Name</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map(skill => (
                        <tr key={skill.RecordID}>
                            <td>{skill.RecordID}</td>
                            <td>{skill.NameEn}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

    );
}

export default App;
