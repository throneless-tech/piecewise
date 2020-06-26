export function seed(knex) {
  return knex('settings')
    .del()
    .then(function() {
      // Inserts seed entries
      return knex('settings').insert([
        {
          id: 1,
          title: 'Piecewise Broadband Speed Test',
          header:
            'Petierunt uti sibi concilium totius Galliae in diem certam indicere. Quis aute iure reprehenderit in voluptate velit esse.',
          footer:
            'Sed haec quis possit intrepidus aestimare tellus. Nihilne te nocturnum praesidium Palati, nihil urbis vigiliae. Qui ipsorum lingua Celtae, nostra Galli appellantur.',
        },
      ]);
    });
}
