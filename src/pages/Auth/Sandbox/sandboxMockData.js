/**
 * Mock data cho Sandbox Board trên trang Login/Register.
 * 100% client-side – không liên quan gì tới Backend hay MongoDB.
 */

export const SANDBOX_BOARD = {
  _id: 'sandbox-board-001',
  title: 'My Project Board',
  columnOrderIds: ['sandbox-col-01', 'sandbox-col-02', 'sandbox-col-03'],
  columns: [
    {
      _id: 'sandbox-col-01',
      boardId: 'sandbox-board-001',
      title: 'To Do',
      cardOrderIds: [
        'sandbox-card-01',
        'sandbox-card-02',
        'sandbox-card-03',
        'sandbox-card-10',
        'sandbox-card-11'
      ],
      cards: [
        {
          _id: 'sandbox-card-01',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-01',
          title: 'Design new landing page',
          cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop',
          memberIds: ['user-01', 'user-02'],
          totalComments: 3,
          attachments: [],
          labelColors: ['#2ecc71', '#3498db'],
          dueDate: null,
          dueComplete: false,
          checklists: [],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-02',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-01',
          title: 'Setup CI/CD pipeline',
          cover: null,
          memberIds: ['user-01'],
          totalComments: 1,
          attachments: [{ _id: 'att-1' }],
          labelColors: ['#e74c3c'],
          dueDate: null,
          dueComplete: false,
          checklists: [
            {
              _id: 'cl-1',
              items: [
                { _id: 'cl-1-i-1', isCompleted: true },
                { _id: 'cl-1-i-2', isCompleted: false },
                { _id: 'cl-1-i-3', isCompleted: false }
              ]
            }
          ],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-03',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-01',
          title: 'Write API documentation',
          cover: null,
          memberIds: [],
          totalComments: 0,
          attachments: [],
          labelColors: [],
          dueDate: null,
          dueComplete: false,
          checklists: [],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-10',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-01',
          title: 'Plan sprint tasks',
          cover: null,
          memberIds: [],
          totalComments: 0,
          attachments: [],
          labelColors: [],
          dueDate: null,
          dueComplete: false,
          checklists: [],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-11',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-01',
          title: 'Review user feedback',
          cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop',
          memberIds: ['user-03'],
          totalComments: 5,
          attachments: [],
          labelColors: ['#f1c40f'],
          dueDate: null,
          dueComplete: false,
          checklists: [],
          customFieldValues: []
        }
      ]
    },
    {
      _id: 'sandbox-col-02',
      boardId: 'sandbox-board-001',
      title: 'In Progress',
      cardOrderIds: [
        'sandbox-card-04',
        'sandbox-card-05',
        'sandbox-card-06',
        'sandbox-card-12'
      ],
      cards: [
        {
          _id: 'sandbox-card-04',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-02',
          title: 'Build user authentication flow',
          cover: null,
          memberIds: ['user-01'],
          totalComments: 2,
          attachments: [],
          labelColors: ['#e74c3c', '#f39c12'],
          dueDate: null,
          dueComplete: false,
          checklists: [
            {
              _id: 'cl-2',
              items: [
                { _id: 'cl-2-i-1', isCompleted: true },
                { _id: 'cl-2-i-2', isCompleted: true },
                { _id: 'cl-2-i-3', isCompleted: false },
                { _id: 'cl-2-i-4', isCompleted: false }
              ]
            }
          ],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-05',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-02',
          title: 'Implement drag & drop board',
          cover: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
          memberIds: ['user-01', 'user-02', 'user-03'],
          totalComments: 8,
          attachments: [{ _id: 'att-4' }],
          labelColors: ['#2ecc71'],
          dueDate: null,
          dueComplete: false,
          checklists: [],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-06',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-02',
          title: 'Research payment gateway',
          cover: null,
          memberIds: ['user-02', 'user-03'],
          totalComments: 5,
          attachments: [{ _id: 'att-2' }, { _id: 'att-3' }],
          labelColors: ['#9b59b6', '#3498db'],
          dueDate: null,
          dueComplete: false,
          checklists: [],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-12',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-02',
          title: 'Weekly team meeting sync',
          cover: null,
          memberIds: [],
          totalComments: 0,
          attachments: [],
          labelColors: [],
          dueDate: null,
          dueComplete: false,
          checklists: [],
          customFieldValues: []
        }
      ]
    },
    {
      _id: 'sandbox-col-03',
      boardId: 'sandbox-board-001',
      title: 'Done',
      cardOrderIds: [
        'sandbox-card-07',
        'sandbox-card-08',
        'sandbox-card-09',
        'sandbox-card-13',
        'sandbox-card-14',
        'sandbox-card-15'
      ],
      cards: [
        {
          _id: 'sandbox-card-07',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-03',
          title: 'Database schema design',
          cover: null,
          memberIds: ['user-01'],
          totalComments: 4,
          attachments: [],
          labelColors: ['#2ecc71', '#3498db'],
          dueDate: null,
          dueComplete: true,
          checklists: [
            {
              _id: 'cl-3',
              items: [
                { _id: 'cl-3-i-1', isCompleted: true },
                { _id: 'cl-3-i-2', isCompleted: true },
                { _id: 'cl-3-i-3', isCompleted: true }
              ]
            }
          ],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-08',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-03',
          title: 'Setup project repository',
          cover: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=600&auto=format&fit=crop',
          memberIds: ['user-01', 'user-02'],
          totalComments: 2,
          attachments: [{ _id: 'att-5' }],
          labelColors: ['#f39c12'],
          dueDate: null,
          dueComplete: true,
          checklists: [],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-09',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-03',
          title: 'Optimize database queries',
          cover: null,
          memberIds: [],
          totalComments: 0,
          attachments: [],
          labelColors: ['#f39c12', '#9b59b6'],
          dueDate: null,
          dueComplete: true,
          checklists: [
            {
              _id: 'cl-4',
              items: [
                { _id: 'cl-4-i-1', isCompleted: true },
                { _id: 'cl-4-i-2', isCompleted: true }
              ]
            }
          ],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-13',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-03',
          title: 'Initial setup meetings',
          cover: null,
          memberIds: [],
          totalComments: 0,
          attachments: [],
          labelColors: [],
          dueDate: null,
          dueComplete: true,
          checklists: [],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-14',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-03',
          title: 'Wireframing',
          cover: null,
          memberIds: [],
          totalComments: 0,
          attachments: [],
          labelColors: [],
          dueDate: null,
          dueComplete: true,
          checklists: [],
          customFieldValues: []
        },
        {
          _id: 'sandbox-card-15',
          boardId: 'sandbox-board-001',
          columnId: 'sandbox-col-03',
          title: 'Prototyping mockups',
          cover: null,
          memberIds: [],
          totalComments: 0,
          attachments: [],
          labelColors: [],
          dueDate: null,
          dueComplete: true,
          checklists: [],
          customFieldValues: []
        }
      ]
    }
  ]
}
