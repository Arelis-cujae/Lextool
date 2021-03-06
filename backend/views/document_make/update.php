<?php


/* @var $this yii\web\View */
/* @var $model backend\models\ComplementaryDoc */
/* @var $project backend\models\Project */
/* @var $plan backend\models\DocMakePlan */
/* @var $docTypes backend\models\DocType[] */

$this->title = 'Editar Documento: ' . $model->docType->name;
$this->params['breadcrumbs'][] = ['label' => 'Planes de confección de documentos complementarios' , 'url' => ['document_make/plans','id_project' => $project->id_project]];
$this->params['breadcrumbs'][] = ['label' => 'Documentos complementarios', 'url' => ['document_make/index', 'id_doc_make_plan' =>$plan->id_doc_make_plan]];
$this->params['breadcrumbs'][] = ['label' => $model->docType->name, 'url' => ['view', 'id' => $model->id_complementary_doc,  'id_doc_make_plan' =>$plan->id_doc_make_plan]];
$this->params['breadcrumbs'][] = 'Editar';
?>
<div class="complementary-doc-update">

    <?= $this->render('_form', [
        'model' => $model,
        'project' => $project,
        'docTypes' => $docTypes,
    ]) ?>

</div>
