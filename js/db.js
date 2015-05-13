export default {

  // Users
  users: [
    {
      id: 1,
      name: 'John Smith',
      birthDate: new Date('1990-10-10 10:00:00Z')
    },
    {
      id: 2,
      name: 'Jane Smith',
      birthDate: new Date('1987-12-25 09:00:00Z')
    },
    {
      id: 3,
      name: 'Radcliff Ryan',
    },
    {
      id: 4,
      name: 'Benjamin Kennith',
    },
    {
      id: 5,
      name: 'River Tony',
    },
    {
      id: 6,
      name: 'Billie Dunstan',
    },
    {
      id: 7,
      name: 'Ritchie Wat',
    },
    {
      id: 8,
      name: 'Emmett Tobin',
    },
    {
      id: 9,
      name: 'Eldon Rube',
    },
  ],

  // Friend Connections
  friends: [
    { from: 1, to: 3 },
    { from: 3, to: 6 },
    { from: 6, to: 1 },
    { from: 4, to: 1 },
    { from: 1, to: 9 },
    { from: 4, to: 7 },
  ]

}
