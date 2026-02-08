import { useEffect, useState } from 'react';
import { Button, EditableText, InputGroup, Toaster } from '@blueprintjs/core';
import './App.css';
import { saveUsers, getUsers, savePendingUser, getPendingUsers, syncPendingUsers } from "./userDB";


const AppToaster = Toaster.create({
    position: "top"
})

// "homepage": "https://karthikgit47.github.io/react-http-crud",

function App() {
    const [users, setUsers] = useState([]);
    const [newName, setNewName] = useState("")
    const [newEmail, setNewEmail] = useState("")

    //For get
    //https://dvmtcreaapi.bexatm.com/api/getpwauser

    //For Save
    //https://dvmtcreaapi.bexatm.com/api/savepwauser


    useEffect(() => {
        async function load() {
            if (navigator.onLine) {
                try {
                    const res = await fetch(
                        "https://dvmtcreaapi.bexatm.com/api/getpwauser"
                    );
                    const json = await res.json();

                    await saveUsers(json.Data); // save API users
                    await loadFromDB();         // 👈 ALWAYS merge
                } catch {
                    loadFromDB();
                }
            } else {
                loadFromDB();
            }
        }

        load();
    }, []);


    async function loadFromDB() {
        const savedUsers = await getUsers();          // API data
        const pendingUsers = await getPendingUsers(); // Offline-added data

        const pendingWithFlag = pendingUsers.map((u, index) => ({
            ...u,
            RecordID: u.RecordID ?? `temp-${index}`,
            isPending: true,
        }));

        setUsers([...savedUsers, ...pendingWithFlag]);

        AppToaster.show({
            message: "Loaded data from offline storage",
            intent: "warning",
        });
    }


    useEffect(() => {
        syncPendingUsers(); // try once on app start

        window.addEventListener("online", syncPendingUsers);

        return () => {
            window.removeEventListener("online", syncPendingUsers);
        };
    }, []);




    function addUser() {
        const name = newName.trim();
        const email = newEmail.trim();

        if (!name || !email) return;

        const newUser = {
            Name: name,
            Email: email,
            RecordID: Date.now(), // temp ID for offline
        };

        if (navigator.onLine) {
            fetch("https://dvmtcreaapi.bexatm.com/api/savepwauser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify({
                    Name: name,
                    Email: email,
                }),
            })
                .then(res => res.json())
                .then(result => {
                    // ✅ USE result.Data (real saved user from API)
                    setUsers([...users, result.Data]);

                    AppToaster.show({
                        message: "User added",
                        intent: "success",
                    });
                })
                .catch(() => {
                    // fallback safety
                    savePendingUser(newUser);
                    setUsers([...users, newUser]);
                });
        } else {
            // ✅ OFFLINE MODE
            savePendingUser(newUser);
            setUsers([...users, newUser]);

            AppToaster.show({
                message: "Saved offline. Will sync later.",
                intent: "warning",
            });
        }

        setNewName("");
        setNewEmail("");
    }



    // function onChangeHandler(id, key, value) {
    //     setUsers((users) => {
    //         return users.map(user => {
    //             return user.id === id ? { ...user, [key]: value } : user;
    //         })
    //     })
    // }

    // function updateUser(id) {
    //     const user = users.find((user) => user.id === id);
    //     fetch(`https://jsonplaceholder.typicode.com/users/10`,
    //         {
    //             method: "PUT",
    //             body: JSON.stringify(user),
    //             headers: {
    //                 "Content-Type": "application/json; charset=UTF-8 "
    //             }
    //         }
    //     )
    //         .then(response => response.json())
    //         .then(data => {
    //             AppToaster.show({
    //                 message: "user updated successfully",
    //                 intent: 'success',
    //                 timeout: 3000
    //             })

    //         })

    // }

    // function deleteUser(id) {
    //     fetch(`https://jsonplaceholder.typicode.com/users/${id}`,
    //         {
    //             method: "DELETE",
    //         })
    //         .then(response => response.json())
    //         .then(data => {
    //             setUsers((users) => {
    //                 return users.filter(user => user.id !== id)
    //             })

    //             AppToaster.show({
    //                 message: "user deleted successfully",
    //                 intent: 'success',
    //                 timeout: 3000
    //             })

    //         })
    // }

    return (


        <div className="App table-wrapper" >
            <table className="bp4-html-table bp4-html-table-striped custom-table" >
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Name</th>
                        <th>Email</th>
                    </tr>
                </thead>

                <tbody>
                    {users.map(skill => (
                        <tr key={skill.RecordID}>
                            <td>{skill.RecordID}</td>
                            <td>{skill.Name}</td>
                            <td>{skill.Email}</td>
                            {/* <td><EditableText onChange={value => onChangeHandler(skill.RecordID, 'Email', value)} value={skill.Email} /></td> */}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td></td>
                        <td>
                            <InputGroup
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder='Enter Name...'
                            />
                        </td>
                        <td>
                            <InputGroup
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder='Enter Email...'
                            />
                        </td>

                        <td>
                            <Button intent='success' onClick={addUser}>Add User</Button>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>

    );
}

export default App;
