import React from 'react'
import { Icon, Button } from 'antd'
import gql from 'graphql-tag'
import { HOCQueryMutation } from '../../../components/shared/hocQueryAndMutation'
import './index.css'

class listUser extends React.Component {
	handlePlus = () => {
		const { mutate, menuId, dishId, dishCount, countProps } = this.props

		if (countProps < dishCount) {
			mutate
				.orderDish({
					mutation: ORDER_DISH,
					variables: {
						input: {
							menuId,
							dishId,
							count: countProps + 1
						}
					},
					refetchQueries: () => [
						{
							query: ORDER_BY_MENU,
							variables: {
								menuId
							}
						}
					]
				})
				.then(() => {
					// console.log(res)
				})
				.catch(err => {
					console.log(err)
				})
		}
	}

	handleMinus = () => {
		const { mutate, menuId, dishId, countProps } = this.props

		if (countProps > 0) {
			mutate
				.orderDish({
					mutation: ORDER_DISH,
					variables: {
						input: {
							menuId,
							dishId,
							count: countProps - 1
						}
					},
					refetchQueries: () => [
						{
							query: ORDER_BY_MENU,
							variables: {
								menuId
							}
						}
					]
				})
				.then(() => {
					// console.log(res)
				})
				.catch(err => {
					console.log(err)
				})
		}
	}

	render() {
		const {
			orderByMenu,
			dishId,
			getUserName,
			dishCount,
			countProps
		} = this.props
		return (
			<>
				{orderByMenu.dishId === dishId ? (
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center'
						}}
					>
						{`${getUserName.user.fullName} ${countProps}/${dishCount}`}
						<div>
							<Button
								disabled={countProps === 0}
								style={{ marginRight: 10 }}
								onClick={() => this.handleMinus(countProps)}
							>
								<Icon type="minus" />
							</Button>
							<Button
								disabled={countProps === dishCount}
								onClick={() => this.handlePlus(countProps)}
							>
								<Icon type="plus" />
							</Button>
						</div>
					</div>
				) : null}
			</>
		)
	}
}

const GET_USER_NAME = gql`
	query user($_id: String!) {
		user(_id: $_id) {
			username
			fullName
		}
	}
`

const ORDER_DISH = gql`
	mutation orderDish($input: CreateOrderInput!) {
		orderDish(input: $input)
	}
`

const ORDER_BY_MENU = gql`
	query ordersByMenu($menuId: String!) {
		ordersByMenu(menuId: $menuId) {
			userId
			dishId
			count
			_id
		}
	}
`

export default HOCQueryMutation([
	{
		query: GET_USER_NAME,
		name: 'getUserName',
		options: props => {
			return {
				variables: {
					_id: props.userId
				}
			}
		}
	},
	{
		query: ORDER_BY_MENU,
		name: 'getOrderByMenu',
		options: props => {
			return {
				variables: {
					menuId: props.menuId
				}
			}
		}
	},
	{
		mutation: ORDER_DISH,
		name: 'orderDish',
		option: {}
	}
])(listUser)
