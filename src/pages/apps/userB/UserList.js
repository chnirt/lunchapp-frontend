import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Modal, Icon } from 'antd'
import openNotificationWithIcon from '../../../components/shared/openNotificationWithIcon'
import { HOCQueryMutation } from '../../../components/shared/hocQueryAndMutation';
import { USER_LOCK_AND_UNLOCK, GET_ALL_USERS, INACTIVE_USER } from './queries'
import { UserModal } from './UserModal'


function UserList(props) {

  function onDelete(_id) {
    Modal.confirm({
      title: 'Bạn có muốn xóa không ?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      icon: 'question-circle',
      onOk: () => props.mutate
        .deleteUser({
          variables: {
            _id
          },
          refetchQueries: [
            {
              query: GET_ALL_USERS
            }
          ]
        })
        .then(res => {
          // console.log(res)
          openNotificationWithIcon('success', 'success', 'Xóa user thành công', null)
        })
        .catch(err => {
          // console.log(err)
          const errors = err.graphQLErrors.map(error => error.message)
          openNotificationWithIcon('error', 'failed', 'Failed', errors[0])
        })
    });

  }

  function onLockAndUnlock(_id) {
    console.log('LockAndUnlock', _id)
    props.mutate
      .lockAndUnlockUser({
        variables: {
          _id
        },
        refetchQueries: [
          {
            query: GET_ALL_USERS
          }
        ]
      })
      .then(res => {
        // console.log(res)
        openNotificationWithIcon('success', 'success', 'Locl user thành công', null)
      })
      .catch(err => {
        // console.log(err)
        const errors = err.graphQLErrors.map(error => error.message)
        openNotificationWithIcon('error', 'failed', 'Failed', errors[0])
      })

  }

  function onEdit(user, id) {
    props.setId(id)
    props.setUser(user)
    props.openModal()
  }

  return (
    <Col
      // key={i}
      xs={{
        span: 22,
        offset: 1
      }}
      sm={{
        span: 10,
        offset: 1
      }}
      md={{
        span: 10,
        offset: 1
      }}
      lg={{
        span: 4,
        offset: 1
      }}
      style={{
        marginBottom: 20
      }}
    >
      <Card
        actions={[
          <Icon type="edit" onClick={() => onEdit(props.userData, props.userData._id)} />,
          <Icon
            type={props.userData.isLocked ? "lock" : 'unlock'}
            onClick={() => onLockAndUnlock(props.userData._id)}
          />,
          <Icon type="delete" onClick={() => onDelete(props.userData._id)} />
        ]}
      >
        {props.userData.fullName}
      </Card>
    </Col>
  )
}

export default HOCQueryMutation([
  {
    query: GET_ALL_USERS
  },
  {
    mutation: USER_LOCK_AND_UNLOCK,
    name: 'lockAndUnlockUser',
    option: {}
  },
  {
    mutation: INACTIVE_USER,
    name: 'deleteUser',
    option: {}
  }
])(UserList)